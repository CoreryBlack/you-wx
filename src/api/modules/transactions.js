import http from '@/utils/http'

/**
 * 获取交易记录
 * params: { user_id, page, limit, startDate, endDate, type }
 */
export const getTransactions = (params = {}) => {
  return http.get('/transactions', { params })
}

/**
 * 创建交易记录（通常为内部或测试使用）
 */
export const createTransaction = (data = {}) => {
  return http.post('/transactions', data)
}
