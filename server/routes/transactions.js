const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Transaction = require('../models/transaction')

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

/**
 * GET /api/transactions
 * 查询交易记录
 * 支持 query: user_id, page, limit, startDate, endDate, type
 */
router.get('/', (req, res) => {
  const { user_id } = req.query || {}
  if (!user_id) return res.status(400).json({ code: 1, message: '缺少 user_id 参数' })

  // 如果提供 Authorization，则校验 token 与 user_id 一致（可选）
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

  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 20,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    type: req.query.type
  }

  const result = Transaction.listByUser(user_id, options)
  return res.json({ code: 0, message: 'success', data: result })
})

/**
 * POST /api/transactions
 * 创建交易记录（用于测试或内部记录）
 * body: { user_id, type, amount, balance, desc }
 */
router.post('/', (req, res) => {
  const body = req.body || {}
  if (!body.user_id) return res.status(400).json({ code: 1, message: '缺少 user_id' })

  const rec = Transaction.create({
    user_id: body.user_id,
    type: body.type,
    amount: body.amount,
    balance: body.balance,
    desc: body.desc
  })

  return res.json({ code: 0, message: 'created', data: rec })
})

module.exports = router
