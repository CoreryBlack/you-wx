/**
 * 通用工具函数
 */

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (fn, interval = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  
  const cloned = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式模板
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化金额
 * @param {number} amount - 金额（分）
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的金额
 */
export const formatMoney = (amount, decimals = 2) => {
  if (typeof amount !== 'number') return '0.00'
  return (amount / 100).toFixed(decimals)
}

/**
 * 隐藏手机号中间四位
 * @param {string} phone - 手机号
 * @returns {string} 隐藏后的手机号
 */
export const hidePhone = (phone) => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 生成随机字符串
 * @param {number} length - 长度
 * @returns {string} 随机字符串
 */
export const randomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 检查是否为空
 * @param {any} value - 要检查的值
 * @returns {boolean} 是否为空
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 获取 URL 参数
 * @param {string} url - URL
 * @returns {Object} 参数对象
 */
export const getUrlParams = (url) => {
  const params = {}
  const search = url.split('?')[1]
  if (!search) return params
  
  search.split('&').forEach(item => {
    const [key, value] = item.split('=')
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
    }
  })
  
  return params
}

/**
 * 对象转 URL 查询字符串
 * @param {Object} params - 参数对象
 * @returns {string} 查询字符串
 */
export const objectToQuery = (params) => {
  if (!params || typeof params !== 'object') return ''
  
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} Promise
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
