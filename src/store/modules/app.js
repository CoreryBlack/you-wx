/**
 * 应用全局状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const loading = ref(false)
  const systemInfo = ref(null)
  const isIOS = ref(false)
  const statusBarHeight = ref(0)

  // 计算属性
  const safeAreaBottom = computed(() => {
    if (!systemInfo.value) return 0
    return systemInfo.value.safeAreaInsets?.bottom || 0
  })

  // 初始化系统信息
  function initSystemInfo() {
    try {
      const info = uni.getSystemInfoSync()
      systemInfo.value = info
      isIOS.value = info.osName === 'ios'
      statusBarHeight.value = info.statusBarHeight || 0
    } catch (e) {
      console.error('获取系统信息失败:', e)
    }
  }

  // 设置加载状态
  function setLoading(value) {
    loading.value = value
    if (value) {
      uni.showLoading({ title: '加载中...' })
    } else {
      uni.hideLoading()
    }
  }

  // 显示提示
  function showToast(message, options = {}) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
      ...options
    })
  }

  // 显示成功提示
  function showSuccess(message) {
    showToast(message, { icon: 'success' })
  }

  // 显示错误提示
  function showError(message) {
    showToast(message, { icon: 'error' })
  }

  return {
    // 状态
    loading,
    systemInfo,
    isIOS,
    statusBarHeight,
    // 计算属性
    safeAreaBottom,
    // 方法
    initSystemInfo,
    setLoading,
    showToast,
    showSuccess,
    showError
  }
})
