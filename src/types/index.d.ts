/**
 * 全局类型定义
 */

// 用户信息
export interface UserInfo {
  id?: string
  phone?: string
  nickName?: string
  avatar?: string
  avatarUrl?: string
  openid?: string
  points?: number
  coupons?: number
  balance?: number
  gender?: number
  country?: string
  province?: string
  city?: string
}

// 油卡信息
export interface OilCard {
  id: string
  cardNo: string
  name: string
  balance: number
  status: 'active' | 'inactive' | 'expired'
  createTime: string
}

// 交易记录
export interface Transaction {
  id: string
  cardId: string
  amount: number
  type: 'recharge' | 'consume' | 'refund'
  description: string
  createTime: string
}

// API 响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 登录请求参数
export interface LoginParams {
  code: string
  nickName?: string
  avatarUrl?: string
  gender?: number
  country?: string
  province?: string
  city?: string
}

// 登录响应
export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

// Tab 项
export interface TabItem {
  pageUrl: string
  name: string
  iconPath: string
  selectedIconPath: string
  style: number
}

// 缓存数据结构
export interface CacheData<T = any> {
  data: T
  timestamp: number
  expireTime: number
  type: string
  key: string
}
