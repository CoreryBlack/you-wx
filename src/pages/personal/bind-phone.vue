<template>
  <view class="page">
    <view class="container">
      <text class="title">绑定手机号</text>

          <view class="field">
            <input v-model="name" type="text" placeholder="请输入姓名（用于实名识别）" />
          </view>

          <view class="field">
            <input v-model="phone" type="number" placeholder="请输入手机号" />
          </view>

          <view class="field code-row">
            <input v-model="code" type="number" placeholder="验证码" />
            <button :disabled="sending || countdown>0" @click="sendCode">
              {{ countdown>0 ? countdown + 's' : '发送验证码' }}
            </button>
          </view>

          <button class="submit" @click="handleBind" :disabled="loading">
            确认绑定
          </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { sendSmsCode, bindPhone } from '@/api'
import { useUserStore } from '@/store'
import router from '@/utils/router'
import { PAGES } from '@/constants'

const userStore = useUserStore()

const name = ref('')
const phone = ref('')
const code = ref('')
// 尝试从路由参数或本地缓存读取 openId
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const options = currentPage?.options || {}
const openIdFromQuery = options.openId || options.openid || null
const tempOpenId = uni.getStorageSync('wx_temp_openId') || null
const openId = openIdFromQuery || tempOpenId || ''
// 读取临时用户信息并预填姓名/手机号
const tempUser = uni.getStorageSync('wx_temp_user') || null
if (tempUser) {
  if (tempUser.nickName) name.value = tempUser.nickName
  if (tempUser.nickname && !name.value) name.value = tempUser.nickname
  if (tempUser.phone) phone.value = tempUser.phone
}
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
let timer = null

const startCountdown = () => {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const sendCode = async () => {
  if (!phone.value) return uni.showToast({ title: '请输入手机号', icon: 'none' })
  if (sending.value || countdown.value>0) return
  sending.value = true
  try {
    await sendSmsCode({ phone: phone.value })
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    startCountdown()
  } catch (e) {
    console.error(e)
  } finally {
    sending.value = false
  }
}

const handleBind = async () => {
  if (loading.value) return
  if (!name.value) return uni.showToast({ title: '请输入姓名', icon: 'none' })
  if (!phone.value) return uni.showToast({ title: '请输入手机号', icon: 'none' })
  if (!code.value) return uni.showToast({ title: '请输入验证码', icon: 'none' })

  loading.value = true
  try {
    const payload = { name: name.value, phone: phone.value, code: code.value }
    if (openId) payload.openId = openId

    const res = await bindPhone(payload)

    // 如果后端返回 token，则完成登录记录
    if (res && res.token) {
      userStore.login({ token: res.token, userInfo: { id: res.id, nickName: res.nickName, avatarUrl: res.avatarUrl, phone: res.phone } })
    } else {
      // 否则仅更新本地用户信息
      userStore.updateUserInfo({ phone: res.phone || phone.value, nickName: res.nickName || name.value })
    }

    // 清理临时 openId
    try { uni.removeStorageSync('wx_temp_openId') } catch (e) {}

    uni.showToast({ title: '绑定成功', icon: 'success' })

    setTimeout(() => {
      // 重定向到个人页或上次重定向页
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const redirect = currentPage?.options?.redirect ? decodeURIComponent(currentPage.options.redirect) : PAGES.PERSONAL
      router.reLaunch(redirect)
    }, 800)
  } catch (err) {
    console.error('绑定失败', err)
    uni.showToast({ title: err?.message || '绑定失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#fff }
.container { width:86%; }
.title { font-size:36rpx; font-weight:600; margin-bottom:30rpx; display:block }
.field { margin-bottom:20rpx }
.field input { width:100%; height:88rpx; border:1px solid #eee; padding:0 20rpx }
.code-row { display:flex; gap:12rpx; align-items:center }
.code-row input { flex:1; height:88rpx; box-sizing:border-box }
.code-row button { width:180rpx; height:88rpx; border-radius:12rpx; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border:1px solid #e6e6e6; padding:0 12rpx; font-size:28rpx }
.submit { margin-top:20rpx; height:88rpx; background:#E6212A; color:#fff; border-radius:44rpx; display:block; text-align:center; line-height:88rpx }
</style>
