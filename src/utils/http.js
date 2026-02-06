/**
 * HTTP 请求封装
 * 基于 uni.request 封装，支持拦截器、请求取消、缓存等功能
 */
import { STORAGE_KEYS, API_CODES, PAGES, PLATFORM } from '@/constants'

// API 基础地址
const getBaseUrl = () => {
  // 优先级：运行时配置 > 环境变量 > 默认值
  let baseUrl = ''
  
  try {
    baseUrl = uni.getStorageSync(STORAGE_KEYS.DEBUG_BASE_API) || ''
  } catch (e) {
    // ignore
  }
  
  // H5 环境读取环境变量
  // #ifdef H5
  if (!baseUrl) {
    baseUrl = import.meta.env.VITE_APP_BASE_API || ''
  }
  // #endif
  
  // 默认值
  if (!baseUrl) {
    baseUrl = 'http://localhost:8080'
  }
  
  return baseUrl.replace(/\/+$/, '') + '/api'
}

// 请求任务管理
const requestTasks = new Map()
let requestId = 0

/**
 * HTTP 请求类
 */
class HttpRequest {
  constructor() {
    this.baseURL = getBaseUrl()
    this.timeout = 30000
    this.header = {
      'Content-Type': 'application/json;charset=utf-8'
    }
  }

  /**
   * 获取请求头
   */
  getHeaders() {
    const headers = { ...this.header }
    
    // 添加平台标识
    // #ifdef MP-WEIXIN
    headers['x-platform'] = 'wechat'
    headers['x-app-id'] = PLATFORM.APP_ID
    // #endif
    
    // 添加 Token
    const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  /**
   * 请求拦截
   */
  beforeRequest(config) {
    config.header = { ...this.getHeaders(), ...config.header }
    config.url = config.url.startsWith('http') ? config.url : this.baseURL + config.url
    config.timeout = config.timeout || this.timeout
    
    // 生成请求 ID
    config._requestId = ++requestId
    
    // 为 GET/DELETE 请求支持 params 参数（axios 习惯）
    if ((config.method === 'GET' || config.method === 'DELETE') && config.params && !config.data) {
      config.data = config.params
    }
    // 对于 POST 请求，将 token 放到请求体中（优先），并从请求头移除 Authorization
    if (config.method === 'POST') {
      try {
        const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
        if (token) {
          if (config.header) {
            delete config.header.Authorization
            delete config.header.authorization
          }

          // 确保 data 是对象，然后注入 token（不覆盖已存在的 token 或 access_token）
          if (!config.data) config.data = {}
          if (typeof config.data === 'object' && config.data !== null) {
            if (!Object.prototype.hasOwnProperty.call(config.data, 'token') && !Object.prototype.hasOwnProperty.call(config.data, 'access_token')) {
              config.data.token = token
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    
    console.log(`[HTTP] 请求: ${config.method} ${config.url}`, config.data || config.params)
    return config
  }

  /**
   * 响应拦截
   */
  afterResponse(response, config) {
    // 移除请求任务
    requestTasks.delete(config._requestId)
    
    const { statusCode, data } = response
    
    console.log(`[HTTP] 响应: ${config.url}`, data)
    
    // HTTP 状态码处理
    if (statusCode >= 200 && statusCode < 300) {
      // 如果响应体有 code 字段，按业务码处理
      if (data && typeof data.code !== 'undefined') {
        if (data.code === API_CODES.SUCCESS || data.code === 0) {
          return data.data !== undefined ? data.data : data
        }
        // 业务错误
        return Promise.reject(this.handleBusinessError(data, config))
      }
      return data
    }
    
    // HTTP 错误
    return Promise.reject(this.handleHttpError(statusCode, data, config))
  }

  /**
   * 处理业务错误
   */
  handleBusinessError(data, config) {
    const { code, message } = data
    
    // 未授权，跳转登录
    if (code === API_CODES.UNAUTHORIZED) {
      this.handleUnauthorized()
    }
    
    // 显示错误提示
    if (!config.silent) {
      uni.showToast({
        title: message || '请求失败',
        icon: 'none'
      })
    }
    
    return { code, message, data: data.data }
  }

  /**
   * 处理 HTTP 错误
   */
  handleHttpError(statusCode, data, config) {
    let message = '网络请求失败'
    
    switch (statusCode) {
      case 401:
        message = '登录已过期'
        this.handleUnauthorized()
        break
      case 403:
        message = '没有权限'
        break
      case 404:
        message = '请求地址不存在'
        break
      case 500:
        message = '服务器错误'
        break
      case 502:
      case 503:
        message = '服务暂不可用'
        break
      default:
        message = data?.message || `请求失败(${statusCode})`
    }
    
    if (!config.silent) {
      uni.showToast({ title: message, icon: 'none' })
    }
    
    return { code: statusCode, message, data }
  }

  /**
   * 处理未授权
   */
  handleUnauthorized() {
    // 清除登录状态
    uni.removeStorageSync(STORAGE_KEYS.TOKEN)
    uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
    
    // 获取当前页面
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = currentPage ? `/${currentPage.route}` : ''
    
    // 避免重复跳转
    if (currentPath !== PAGES.LOGIN) {
      uni.redirectTo({
        url: `${PAGES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`
      })
    }
  }

  /**
   * 发起请求
   */
  request(options) {
    const config = this.beforeRequest(options)
    
    return new Promise((resolve, reject) => {
      const task = uni.request({
        ...config,
        success: (res) => {
          try {
            const result = this.afterResponse(res, config)
            // afterResponse 可能返回同步值或 Promise，统一用 Promise.resolve 包装
            Promise.resolve(result).then(resolve).catch(reject)
          } catch (e) {
            reject(e)
          }
        },
        fail: (err) => {
          requestTasks.delete(config._requestId)
          console.error(`[HTTP] 请求失败: ${config.url}`, err)
          
          if (!config.silent) {
            uni.showToast({
              title: err.errMsg || '网络请求失败',
              icon: 'none'
            })
          }
          reject(err)
        }
      })
      
      // 保存请求任务
      requestTasks.set(config._requestId, task)
    })
  }

  /**
   * GET 请求
   */
  get(url, options = {}) {
    return this.request({ ...options, url, method: 'GET' })
  }

  /**
   * POST 请求
   */
  post(url, data = {}, options = {}) {
    return this.request({ ...options, url, data, method: 'POST' })
  }

  /**
   * PUT 请求
   */
  put(url, data = {}, options = {}) {
    return this.request({ ...options, url, data, method: 'PUT' })
  }

  /**
   * DELETE 请求
   */
  delete(url, options = {}) {
    return this.request({ ...options, url, method: 'DELETE' })
  }

  /**
   * 文件上传
   */
  upload(url, options) {
    const config = this.beforeRequest({ url, method: 'UPLOAD', ...options })
    
    return new Promise((resolve, reject) => {
      const formData = { ...(options.formData || {}) }
      try {
        const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
        if (token && !formData.token && !formData.access_token) {
          formData.token = token
        }
      } catch (e) {
        // ignore
      }

      uni.uploadFile({
        url: config.url,
        filePath: options.filePath,
        name: options.name || 'file',
        header: config.header,
        formData,
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === API_CODES.SUCCESS || data.code === 0) {
              resolve(data.data || data)
            } else {
              reject(this.handleBusinessError(data, config))
            }
          } catch (e) {
            reject({ code: -1, message: '解析响应失败' })
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 取消所有请求
   */
  cancelAll() {
    requestTasks.forEach((task) => {
      if (task && task.abort) {
        task.abort()
      }
    })
    requestTasks.clear()
  }
}

// 导出单例
const http = new HttpRequest()
export default http

// 导出取消方法
export const cancelAllRequests = () => http.cancelAll()
