/**
 * API 统一入口
 * 集中管理所有 API 接口
 */
import * as authApi from './modules/auth'
import * as oilApi from './modules/oil'
import * as userApi from './modules/user'
import * as qrApi from './modules/qr'

export { authApi, oilApi, userApi }

// 也可以直接导出所有方法
export * from './modules/auth'
export * from './modules/oil'
export * from './modules/user'
export * from './modules/qr'
export { qrApi }
