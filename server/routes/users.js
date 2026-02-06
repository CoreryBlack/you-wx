const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// 使用 User 实体模型（单例内存实现，生产请替换为数据库模型）
const User = require('../models/user');

// 从环境变量读取微信配置和JWT密钥
const WECHAT_APPID = process.env.WECHAT_APPID;
const WECHAT_SECRET = process.env.WECHAT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

if (!WECHAT_APPID || !WECHAT_SECRET) {
  console.warn('WECHAT_APPID or WECHAT_SECRET not set. Please set them in .env');
}

/**
 * POST /users/wx-login - 微信一键登录（小程序端）
 * 对应文档中的用户管理部分，创建/更新用户并返回token
 */
router.post('/wx-login', async (req, res) => {
  try {
    // 兼容前端两种请求体格式：
    // 1) 顶层字段 { code, nickName, avatarUrl, ... }
    // 2) 嵌套 userInfo: { code, userInfo: { nickName, avatarUrl, ... } }
    const body = req.body && req.body.userInfo ? Object.assign({}, req.body, req.body.userInfo) : req.body;
    const { code, nickName, avatarUrl, gender, country, province, city } = body;

    if (!code) {
      return res.status(400).json({ code: 1, msg: '缺少 code 参数' });
    }

    // 使用 jscode2session 接口换取 openid 和 session_key
    const jscodeUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;

    const wxResp = await axios.get(jscodeUrl, { timeout: 5000 });
    const wxData = wxResp.data;

    if (wxData.errcode) {
      return res.status(400).json({ code: 1, msg: '微信换取 session 失败', detail: wxData });
    }

    const { openid, session_key, unionid } = wxData;

    if (!openid) {
      return res.status(400).json({ code: 1, msg: '未获取到 openid' });
    }

    // 使用 User 实体创建或更新用户（封装内存操作）
    const user = User.createOrUpdateByOpenid(openid, {
      unionid,
      nickName,
      avatarUrl,
      gender,
      country,
      province,
      city
    });

    // 检查是否需要绑定手机号（即无手机号的新用户）
    const needBind = !user.phone;

    // 如果需要绑定，则不生成 Token（或者虽然生成但不发给前端的正式Token字段，视业务而定）
    // 为了前端逻辑一致：needBind=true 时，不返回 token，返回 openId
    if (needBind) {
      return res.json({
        code: 0,
        msg: '需绑定手机号',
        data: {
            needBind: true,
            openId: user.openid,
            userInfo: {
                nickName: user.nickname, // 兼容前端 nickName
                nickname: user.nickname,
                avatarUrl: user.avatar_url, // 兼容前端 avatarUrl
                avatar_url: user.avatar_url,
                gender: user.gender
            }
        }
      });
    }

    // 生成 JWT token
    const tokenPayload = {
      sub: user.user_id,
      openid: user.openid,
      type: 'user', // 区分用户类型：user vs staff
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // 返回前端所需数据结构 - 遵循API文档格式
    return res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        needBind: false,
        userInfo: {
          user_id: user.user_id,
          nickName: user.nickname, // 前端 Store 用 nickName
          nickname: user.nickname,
          avatarUrl: user.avatar_url, // 前端 Store 用 avatarUrl
          avatar_url: user.avatar_url,
          phone: user.phone,
          status: user.status,
          gender: user.gender
        }
      }
    });
  } catch (error) {
    console.error('wx-login error:', error?.response?.data || error.message || error);
    return res.status(500).json({ code: 1, msg: '服务器内部错误' });
  }
});

/**
 * GET /users/profile - 获取当前用户信息
 * Header: Authorization: Bearer <token>
 */
router.get('/profile', (req, res) => {
  try {
    // 支持通过 openId 查询用户信息（小程序端有时使用 openId 直接查询）
    const queryOpenId = req.query.openId || req.query.openid
    if (queryOpenId) {
      const user = User.findByOpenid(queryOpenId)
      if (!user) return res.status(404).json({ code: 1, msg: '用户不存在' })

      return res.json({
        code: 0,
        msg: 'success',
        data: {
          user_id: user.user_id,
          phone: user.phone,
          nickName: user.nickname, // 兼容 Camel
          nickname: user.nickname,
          avatarUrl: user.avatar_url, // 兼容 Camel
          avatar_url: user.avatar_url,
          status: user.status,
          create_time: user.create_time,
          update_time: user.update_time
        }
      })
    }

    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ code: 1, msg: '未提供 token' });
    }

    const token = auth.replace(/^Bearer\s+/, '');
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ code: 1, msg: '无效或已过期的 token' });
    }

    const userId = payload.sub;
    // 使用 User 实体查找
    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 1, msg: '用户不存在' });
    }

    return res.json({
      code: 0,
      msg: 'success',
      data: {
        user_id: user.user_id,
        phone: user.phone,
        nickName: user.nickname, // 兼容 Camel
        nickname: user.nickname,
        avatarUrl: user.avatar_url, // 兼容 Camel
        avatar_url: user.avatar_url,
        status: user.status,
        create_time: user.create_time,
        update_time: user.update_time
      }
    });
  } catch (err) {
    console.error('profile error:', err);
    return res.status(500).json({ code: 1, msg: '服务器错误' });
  }
});

/**
 * PUT /users/profile - 更新当前用户信息
 * 允许更新: nickname, phone 等
 */
router.put('/profile', (req, res) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ code: 1, msg: '未提供 token' });
    }

    const token = auth.replace(/^Bearer\s+/, '');
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ code: 1, msg: '无效或已过期的 token' });
    }

    const userId = payload.sub;
    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 1, msg: '用户不存在' });
    }

    // 更新允许的字段，通过 User 实体完成更新并返回最新对象
    const { nickname, phone } = req.body;
    const updated = User.updateById(user.user_id, { nickname, phone });
    if (!updated) {
      return res.status(500).json({ code: 1, msg: '更新失败' });
    }
    
    // 使用最新对象
    const newUser = updated;

    return res.json({
      code: 0,
      msg: '更新成功',
      data: {
        user_id: newUser.user_id,
        phone: newUser.phone,
        nickname: newUser.nickname,
        avatar_url: newUser.avatar_url,
        status: newUser.status,
        update_time: newUser.update_time
      }
    });
  } catch (err) {
    console.error('update profile error:', err);
    return res.status(500).json({ code: 1, msg: '服务器错误' });
  }
});

module.exports = router;

// 说明: 实现了基于 docs/API_REFERENCE.md 的用户管理接口
// - POST /users/wx-login: 微信一键登录，创建/更新用户
// - GET /users/profile: 获取当前用户信息  
// - PUT /users/profile: 更新用户资料
// 注意: 当前使用内存存储，生产环境请连接到 MySQL 数据库