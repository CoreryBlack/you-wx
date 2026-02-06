const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// 引入共享的 User 模型
const User = require('../models/user');

const router = express.Router();

// 从环境变量读取微信配置和JWT密钥
const WECHAT_APPID = process.env.WECHAT_APPID;
const WECHAT_SECRET = process.env.WECHAT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

if (!WECHAT_APPID || !WECHAT_SECRET) {
  // console.warn('WECHAT_APPID or WECHAT_SECRET not set.');
}

/**
 * POST /auth/wx-login
 * 仅保留占位，实际业务应走 users/wx-login
 */
router.post('/wx-login', async (req, res) => {
    return res.status(301).json({ code: 1, message: 'Please use /api/users/wx-login' });
});

/**
 * POST /auth/bind-phone
 * body: { phone, code, name, openId }
 * Header: Authorization (optional)
 */
router.post('/bind-phone', (req, res) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization
    let user = null

    // 1. Token 验证
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.replace(/^Bearer\s+/, '')
      try {
        const payload = jwt.verify(token, JWT_SECRET)
        // 使用 Model 查找: User.store is Map<openid, user>
        // We need lookup by ID.
        const allUsers = User.all();
        user = allUsers.find(u => u.user_id === payload.sub);
      } catch (e) {}
    } 
    
    // 2. OpenId 验证
    if (!user && req.body.openId) {
        user = User.store.get(req.body.openId);
    }

    if (!user) {
        return res.status(404).json({ code: 1, message: '用户不存在' })
    }

    const { phone, name } = req.body
    if (!phone) return res.status(400).json({ code: 1, message: '缺少 phone 参数' })

    // 更新信息
    user.phone = phone
    if (name) {
        user.nickname = name; // Model standard
        user.nickName = name; // Wechat standard
    }
    
    // User model is in-memory, updating reference works
    // User.createOrUpdateByOpenid will also work but we just update fields here.

    // 生成 Token
    const tokenPayload = { 
        sub: user.user_id, 
        openid: user.openid, 
        type: 'user',
        iat: Math.floor(Date.now() / 1000) 
    }
    const newToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

    return res.json({
      code: 0,
      message: '绑定成功',
      data: {
        id: user.user_id,
        nickName: user.nickname, 
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        token: newToken
      }
    })
  } catch (err) {
    console.error('bind-phone error:', err)
    return res.status(500).json({ code: 1, message: '服务器错误' })
  }
})

module.exports = router;

