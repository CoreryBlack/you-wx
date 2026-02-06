const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 从环境变量读取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// 模拟油卡数据 (内存存储)
// 假设这些卡属于 ID 为 "805727065608425472" 的用户 (CoreryBlack) 以便演示
const DEMO_USER_ID = "805727065608425472";

const cards = [
  {
    id: 1,
    name: '中石油个人卡',
    cardNo: '9000888812345678',
    balance: 500.00,
    status: 1, // 1: 正常, 0: 冻结
    type: 1, // 1: 个人, 2: 车队
    userId: DEMO_USER_ID
  },
  {
    id: 2,
    name: '中石化车队卡',
    cardNo: '1000666687654321',
    balance: 1280.50,
    status: 1,
    type: 2,
    userId: DEMO_USER_ID
  }
];

/**
 * GET /api/cards
 * 获取用户油卡列表
 * 支持：
 *  - Authorization: Bearer <token> （优先，token.sub 作为 userId）
 *  - ?user_id=xxxx 查询（若无 token）
 */
router.get('/', (req, res) => {
  // 强制要求 query 参数提供 user_id（避免泄露他人信息）
  const { user_id } = req.query || {}
  if (!user_id) {
    return res.status(400).json({ code: 1, message: '缺少 user_id 参数' })
  }

  // 如果请求中带了 Authorization，则校验 token 中的用户 id 与 query.user_id 一致
  const auth = req.headers.authorization || req.headers.Authorization
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.replace(/^Bearer\s+/, '')
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      if (!payload || !payload.sub || String(payload.sub) !== String(user_id)) {
        return res.status(403).json({ code: 1, message: '无权限访问该用户数据' })
      }
    } catch (e) {
      return res.status(401).json({ code: 1, message: '无效或过期的 token' })
    }
  }

  // 仅返回与 user_id 匹配的卡片
  const list = cards.filter(c => String(c.userId) === String(user_id) || c.userId === 'all')

  return res.json({ code: 0, message: 'success', data: list })
})

module.exports = router;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 从环境变量读取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// 模拟油卡数据 (内存存储)
// 假设这些卡属于 ID 为 "805727065608425472" 的用户 (CoreryBlack) 以便演示
const DEMO_USER_ID = "805727065608425472";

const cards = [
  {
    id: 1,
    name: '中石油个人卡',
    cardNo: '9000888812345678',
    balance: 500.00,
    status: 1, // 1: 正常, 0: 冻结
    type: 1, // 1: 个人, 2: 车队
    userId: DEMO_USER_ID
  },
  {
    id: 2,
    name: '中石化车队卡',
    cardNo: '1000666687654321',
    balance: 1280.50,
    status: 1,
    type: 2,
    userId: DEMO_USER_ID
  }
];

/**
 * GET /api/cards
 * 获取用户油卡列表
 */
router.get('/', (req, res) => {
  const { userId } = req.query;
  
  let list = cards;
  
  // 如果提供了 userId，则进行筛选
  if (userId) {
     list = cards.filter(c => c.userId === userId || c.userId === 'all');
     
     // 为了演示方便，如果找不到且 userId 长度正常，可能我们也想返回空，或者给 demo 数据
     // 严格模式：只返回匹配的
  }
  
  // 简单的模拟返回
  res.json({
    code: 0,
    message: 'success',
    data: list
  });
});
    data: cards
  });
});

module.exports = router;
