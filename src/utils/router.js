/**
 * 路由工具
 * 封装导航方法，支持权限控制、登录拦截等
 */
import { PAGES, WHITE_LIST, STORAGE_KEYS } from '@/constants'
import { cancelAllRequests } from './http'

/**
 * 检查是否已登录
 */
export const isLoggedIn = () => {
  return !!uni.getStorageSync(STORAGE_KEYS.TOKEN)
}

/**
 * 检查页面是否在白名单中
 */
export const isInWhiteList = (path) => {
  const purePath = path.split('?')[0]
  return WHITE_LIST.includes(purePath)
}

/**
 * 导航到页面
 * @param {string} url - 页面路径
 * @param {Object} [options] - 选项
 * @param {boolean} [options.checkLogin=true] - 是否检查登录
 */
export const navigateTo = (url, options = {}) => {
  const { checkLogin = true } = options
  
  // 取消之前的请求
  cancelAllRequests()
  
  // 登录检查
  if (checkLogin && !isInWhiteList(url) && !isLoggedIn()) {
    return uni.navigateTo({
      url: `${PAGES.LOGIN}?redirect=${encodeURIComponent(url)}`
    })
  }
  
  return uni.navigateTo({ url })
}

/**
 * 重定向到页面
 */
export const redirectTo = (url, options = {}) => {
  const { checkLogin = true } = options
  
  cancelAllRequests()
  
  if (checkLogin && !isInWhiteList(url) && !isLoggedIn()) {
    return uni.redirectTo({
      url: `${PAGES.LOGIN}?redirect=${encodeURIComponent(url)}`
    })
  }
  
  return uni.redirectTo({ url })
}

/**
 * 重新启动到页面
 */
export const reLaunch = (url) => {
  cancelAllRequests()
  return uni.reLaunch({ url })
}

/**
 * 返回上一页
 */
export const navigateBack = (delta = 1) => {
  cancelAllRequests()
  return uni.navigateBack({ delta })
}

/**
 * 跳转到 Tab 页面
 */
export const switchTab = (url) => {
  cancelAllRequests()
  
  // uni-app 的 switchTab 需要在 pages.json 中配置 tabBar
  // 当前项目使用自定义 tabBar，所以用 reLaunch 替代
  return uni.reLaunch({ url })
}

/**
 * 获取当前页面路径
 */
export const getCurrentPath = () => {
  const pages = getCurrentPages()
  if (pages.length === 0) return ''
  const currentPage = pages[pages.length - 1]
  return `/${currentPage.route}`
}

/**
 * 获取上一页面路径
 */
export const getPrevPath = () => {
  const pages = getCurrentPages()
  if (pages.length < 2) return ''
  const prevPage = pages[pages.length - 2]
  return `/${prevPage.route}`
}

/**
 * 路由对象（模块化导出）
 */
export const router = {
  push: navigateTo,
  replace: redirectTo,
  reLaunch,
  back: navigateBack,
  switchTab,
  getCurrentPath,
  getPrevPath,
  isLoggedIn,
  isInWhiteList
}

export default router
