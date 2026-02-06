/**
 * 认证相关 API
 */
import http from '@/utils/http'

/**
 * 发送短信验证码
 * @param {Object} data - 请求参数
 * @param {string} data.phone - 手机号
 * @returns {Promise} API 响应
 */
export const sendSmsCode = (data) => {
  return http.post('/auth/send-code', data)
}

/**
 * 手机号登录
 * @param {Object} data - 请求参数
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @returns {Promise} API 响应
 */
export const loginByPhone = (data) => {
  return http.post('/auth/login', data)
}

/**
 * 注册并登录
 * @param {Object} data - 请求参数
 * @returns {Promise} API 响应
 */
export const registerUser = (data) => {
  return http.post('/auth/register', data)
}

/**
 * 微信一键登录
 * @param {Object} data - 请求参数
 * @param {string} data.code - 微信登录凭证
 * @param {string} [data.nickName] - 昵称
 * @param {string} [data.avatarUrl] - 头像
 * @param {number} [data.gender] - 性别
 * @param {string} [data.country] - 国家
 * @param {string} [data.province] - 省份
 * @param {string} [data.city] - 城市
 * @returns {Promise<{token: string, userInfo: Object}>} 登录响应
 */
export const wxLogin = (data) => {
  return http.post('/users/wx-login', data)
}

/**
 * 绑定手机号
 * @param {{phone:string, code?:string}} data
 */
export const bindPhone = (data) => {
  return http.post('/auth/bind-phone', data)
}

/**
 * 刷新 Token
 * @returns {Promise<{token: string}>} 新 Token
 */
export const refreshToken = () => {
  return http.post('/auth/refresh-token')
}

/**
 * 退出登录
 * @returns {Promise} API 响应
 */
export const logout = () => {
  return http.post('/auth/logout')
}
