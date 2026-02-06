import http from '@/utils/http'

/**
 * 获取新版二维码动态 token
 * GET /api/qr/get_dynamic_token
 */
export function getDynamicToken(params = {}) {
  return http.get('/qr/get_dynamic_token', { params })
}

export default { getDynamicToken }
