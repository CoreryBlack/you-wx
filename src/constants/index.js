/**
 * 全局常量定义
 */

// 存储键名常量
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  DEBUG_BASE_API: 'debug_base_api'
}

// 页面路径常量
export const PAGES = {
  INDEX: '/pages/index/index',
  PERSONAL: '/pages/personal/index',
  LOGIN: '/pages/personal/login',
  QRCODE: '/pages/qrcode/qrcode',
  OIL_CARDS: '/pages/oilcards/oilcards',
  OIL_ACTIVATE: '/pages/oilcards/activate'
  ,
  TRANSACTIONS: '/pages/personal/transactions',
  BIND_PHONE: '/pages/personal/bind-phone'
}

// 路由白名单（无需登录即可访问）
export const WHITE_LIST = [
  PAGES.INDEX,
  PAGES.LOGIN
]

// API 响应状态码
export const API_CODES = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// 缓存配置
export const CACHE_CONFIG = {
  // 默认缓存时间: 12小时
  DEFAULT_MAX_AGE: 12 * 60 * 60 * 1000,
  // 最大缓存项数
  MAX_SIZE: 100,
  // 缓存前缀
  PREFIX: 'app_cache_'
}

// 缓存类型
export const CACHE_TYPES = {
  IMAGE: 'image',
  API: 'api',
  FILE: 'file'
}

// 平台标识
export const PLATFORM = {
  // #ifdef MP-WEIXIN
  TYPE: 'wechat',
  APP_ID: 'wxc9c7dc34af711d97',
  // #endif
  // #ifdef APP-PLUS
  TYPE: 'app',
  APP_ID: '__UNI__FDB2637',
  // #endif
  // #ifdef H5
  TYPE: 'h5',
  APP_ID: 'h5_app',
  // #endif
}

// 主题颜色
export const THEME = {
  PRIMARY: '#E6212A',
  SUCCESS: '#67C23A',
  WARNING: '#E6A23C',
  DANGER: '#F56C6C',
  INFO: '#909399'
}
