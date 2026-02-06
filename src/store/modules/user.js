/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(uni.getStorageSync(STORAGE_KEYS.TOKEN) || '')
  const userInfo = ref(uni.getStorageSync(STORAGE_KEYS.USER_INFO) || {})

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value.nickName || userInfo.value.phone || '未登录')
  const userAvatar = computed(() => userInfo.value.avatarUrl || userInfo.value.avatar || '/static/personal/avatar.png')

  // 操作方法
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      uni.setStorageSync(STORAGE_KEYS.TOKEN, newToken)
    } else {
      uni.removeStorageSync(STORAGE_KEYS.TOKEN)
    }
  }

  function setUserInfo(info) {
    userInfo.value = info || {}
    if (info) {
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, info)
    } else {
      uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
    }
  }

  function login(data) {
    const { token: newToken, userInfo: info } = data
    setToken(newToken)
    setUserInfo(info)
  }

  function logout() {
    setToken('')
    setUserInfo(null)
  }

  function updateUserInfo(partialInfo) {
    userInfo.value = { ...userInfo.value, ...partialInfo }
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo.value)
  }

  return {
    // 状态
    token,
    userInfo,
    // 计算属性
    isLoggedIn,
    userName,
    userAvatar,
    // 方法
    setToken,
    setUserInfo,
    login,
    logout,
    updateUserInfo
  }
})
