// 简单的 Transaction 实体（内存实现），用于开发和测试
class TransactionModel {
  constructor() {
    // 使用数组存储记录
    this.store = []
    this.nextId = 1
  }

  genId() {
    return String(this.nextId++)
  }

  /**
   * 创建交易记录
   * @param {Object} rec - { user_id, type, amount, balance, desc }
   */
  create(rec = {}) {
    const now = new Date().toISOString()
    const record = {
      id: this.genId(),
      user_id: rec.user_id || null,
      type: rec.type || 'other', // e.g. 'payment','refund','recharge'
      amount: typeof rec.amount === 'number' ? rec.amount : Number(rec.amount) || 0,
      balance: typeof rec.balance === 'number' ? rec.balance : Number(rec.balance) || 0,
      desc: rec.desc || '',
      created_at: now
    }

    this.store.push(record)
    return record
  }

  /**
   * 按用户查询，支持分页与时间范围过滤
   * options: { page=1, limit=20, startDate, endDate, type }
   */
  listByUser(user_id, options = {}) {
    const page = Number(options.page) || 1
    const limit = Number(options.limit) || 20
    let list = this.store.filter(r => String(r.user_id) === String(user_id))

    if (options.type) {
      list = list.filter(r => r.type === options.type)
    }

    if (options.startDate) {
      const s = new Date(options.startDate)
      if (!isNaN(s)) list = list.filter(r => new Date(r.created_at) >= s)
    }
    if (options.endDate) {
      const e = new Date(options.endDate)
      if (!isNaN(e)) list = list.filter(r => new Date(r.created_at) <= e)
    }

    // 按时间倒序
    list = list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const total = list.length
    const start = (page - 1) * limit
    const data = list.slice(start, start + limit)

    return { list: data, total }
  }

  // 返回全部（用于调试）
  all() {
    return this.store.slice()
  }
}

const Transaction = new TransactionModel()
module.exports = Transaction
