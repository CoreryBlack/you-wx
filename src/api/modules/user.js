/**
 * 用户相关 API
 */
import http from '@/utils/http'

/**
 * 获取用户信息
 * @returns {Promise<Object>} 用户信息
 */
/**
 * 获取用户信息
 * @param {Object} [opts] - 可选参数
 * @param {string} [opts.openId] - 如果提供 openId，则以查询字符串方式传递，允许无 token 查询
 */
export const getUserInfo = (opts = {}) => {
  if (opts.openId) {
    return http.get(`/users/profile?openId=${encodeURIComponent(opts.openId)}`)
  }
  return http.get('/users/profile')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @param {string} [data.nickName] - 昵称
 * @param {string} [data.avatar] - 头像
 * @param {string} [data.phone] - 手机号
 * @returns {Promise<Object>} 更新后的用户信息
 */
export const updateUserInfo = (data) => {
  return http.put('/users/profile', data)
}

/**
 * 获取用户积分
 * @returns {Promise<{points: number, history: Array}>} 积分信息
 */
export const getUserPoints = () => {
  return http.get('/users/points')
}

/**
 * 获取用户卡券
 * @param {Object} [params] - 查询参数
 * @param {string} [params.status] - 状态: available | used | expired
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @returns {Promise<{list: Array, total: number}>} 卡券列表
 */
export const getUserCoupons = (params = {}) => {
  return http.get('/users/coupons', { params })
}

/**
 * 获取用户余额
 * @returns {Promise<{balance: number}>} 余额信息
 */
export const getUserBalance = () => {
  return http.get('/users/balance')
}

/**
 * 上传头像
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<{url: string}>} 头像 URL
 */
export const uploadAvatar = (filePath) => {
  return http.upload('/users/avatar', {
    filePath,
    name: 'file'
  })
}

/**
 * 获取后端生成的会员码（二维码链接或 base64）
 * @param {Object} [params] - 可选参数，如 user_id
 * @returns {Promise<Object>} { url: string, code: string }
 */
export const getMemberCode = (params = {}) => {
  // 仅使用新版二维码接口 /qr/get_dynamic_token，移除对旧接口的任何回退
  return http.get('/qr/get_dynamic_token', { params })
    .then((res) => {
      if (!res) {
        return Promise.reject({ code: -1, message: 'Empty response from /qr/get_dynamic_token' })
      }

      // 如果后端直接返回 url 或 base64 图片，直接使用
      if (res.url || res.qrUrl || res.image || res.base64) {
        return res
      }

      // 如果返回 token，生成二维码图片 URL 作为展示
      const token = res.token || (res.data && res.data.token)
      const expiresIn = res.expires_in || res.expiresIn || (res.data && res.data.expires_in)
      if (token) {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(String(token))}`
        return { url, token, expires_in: expiresIn }
      }

      return Promise.reject({ code: -1, message: 'Invalid response from /qr/get_dynamic_token' })
    })
}
