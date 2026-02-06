/**
 * 油卡相关 API
 */
import http from '@/utils/http'

/**
 * 获取油卡列表
 * @param {Object} [params] - 查询参数
 * @returns {Promise<Array>} 油卡列表
 */
export const getOilCards = (params = {}) => {
  return http.get('/cards', { params })
}

/**
 * 获取油卡详情
 * @param {string} id - 油卡 ID
 * @returns {Promise<Object>} 油卡详情
 */
export const getOilCardDetail = (id) => {
  return http.get(`/oil/card/${id}`)
}

/**
 * 激活油卡
 * @param {Object} data - 激活参数
 * @param {string} data.cardNo - 卡号
 * @param {string} data.password - 密码
 * @returns {Promise<Object>} 激活结果
 */
export const activateOilCard = (data) => {
  return http.post('/oil/activate', data)
}

/**
 * 绑定油卡
 * @param {Object} data - 绑定参数
 * @param {string} data.cardNo - 卡号
 * @param {string} data.name - 持卡人姓名
 * @returns {Promise<Object>} 绑定结果
 */
export const bindOilCard = (data) => {
  return http.post('/oil/bind', data)
}

/**
 * 解绑油卡
 * @param {string} cardId - 油卡 ID
 * @returns {Promise} API 响应
 */
export const unbindOilCard = (cardId) => {
  return http.post('/oil/unbind', { cardId })
}

// NOTE: `getTransactions` (POST/GET /oil/transactions) 已移除，
// 如果需要交易记录请使用通用交易接口或后端提供的新接口。

/**
 * 获取交易详情
 * @param {string} id - 交易 ID
 * @returns {Promise<Object>} 交易详情
 */
export const getTransactionDetail = (id) => {
  return http.get(`/oil/transaction/${id}`)
}
