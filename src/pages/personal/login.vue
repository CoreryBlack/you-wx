<template>
  <view class="page">
    <!-- 背景图 -->
    <image 
      class="bg-top" 
      src="/static/personal/login/bg_top.png" 
      mode="widthFix"
    />
    <image 
      class="bg-bottom" 
      src="/static/personal/login/bg_bottom.png" 
      mode="widthFix"
    />

    <!-- 登录内容 -->
    <view class="login-container">
      <view class="header">
        <text class="title">欢迎回来！</text>
        <text class="subtitle">快速安全登录</text>
      </view>

      <view class="login-content">
        <button
          class="wx-login-btn"
          @click="handleWxLogin"
          :loading="loading"
          :disabled="loading"
        >
          <image 
            class="wx-icon" 
            src="/static/personal/login/wx.png" 
            mode="aspectFit"
          />
          <text>微信一键登录</text>
        </button>
      </view>

      <view class="footer">
        <text class="agreement">
          登录即表示同意
          <text class="link" @click="handleAgreement">《用户协议》</text>
          和
          <text class="link" @click="handlePrivacy">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { wxLogin } from '@/api'
import { PAGES } from '@/constants'
import router from '@/utils/router'
import { getUrlParams } from '@/utils'

// Store
const userStore = useUserStore()

// 状态
const loading = ref(false)

// 获取重定向地址
const getRedirectUrl = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.options || {}
  return options.redirect ? decodeURIComponent(options.redirect) : PAGES.INDEX
}

// 微信登录
const handleWxLogin = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // 1. 只获取登录 Code 并发送给后端，由后端解析并验证登录结果
    const loginRes = await uni.login({ provider: 'weixin' })
    const code = Array.isArray(loginRes) ? loginRes[1]?.code : loginRes.code

    if (!code) {
      throw new Error('获取登录凭证失败')
    }

    // 调用后端登录接口（仅传 code）
    const res = await wxLogin({ code })

    // 如果后端要求绑定手机号，先跳转到绑定页（不保存 token/userInfo）
    if (res && res.needBind) {
      console.log('wxLogin needBind response:', res)
      // 保存 openId 到本地临时存储，绑定页会使用它
      if (res.openId) {
        uni.setStorageSync('wx_temp_openId', res.openId)
      }

      // 如果后端同时返回了用户信息，保存为临时用户并写入 store 以便页面显示
      const returnedUser = res.user || res.userInfo || res.user_data || res.data || null
      if (returnedUser) {
        const temp = {
          nickName: returnedUser.nickname || returnedUser.nickName || returnedUser.nick || returnedUser.userName || '',
          avatarUrl: returnedUser.avatar_url || returnedUser.avatarUrl || returnedUser.avatar || '' ,
          phone: returnedUser.phone || ''
        }
        try { uni.setStorageSync('wx_temp_user', temp) } catch(e){}
        // 更新 store 的 userInfo（不写 token）
        try { userStore.setUserInfo(temp) } catch(e){}
      }

      // 立即关闭 loading，避免按钮持续转圈
      loading.value = false

      uni.showToast({ title: '需要绑定手机号', icon: 'none', duration: 1200 })
      const redirectUrl = getRedirectUrl()
      // 立即跳转到绑定页，避免与路由守卫或定时器冲突
      router.push(`${PAGES.BIND_PHONE}?redirect=${encodeURIComponent(redirectUrl)}`, { checkLogin: false })
      return
    }

    // 保存登录状态（后端未要求绑定）
    const finalUser = res.user || res.userInfo || {}
    // 映射后端字段到前端 store 格式 (nickName, avatarUrl)
    // 后端: nickname, avatar_url, userId
    // 前端: nickName, avatarUrl
    const normalizedUserId = finalUser.user_id || finalUser.userId || finalUser.id || ''
    const storeUser = {
      ...finalUser,
      userId: normalizedUserId,
      user_id: normalizedUserId,
      id: normalizedUserId,
      nickName: finalUser.nickname || finalUser.nickName || '',
      avatarUrl: finalUser.avatar || finalUser.avatar_url || finalUser.avatarUrl || ''
    }

    userStore.login({
      token: res.token,
      userInfo: storeUser
    })

    // 跳转
    uni.showToast({ title: '登录成功', icon: 'success', duration: 1500 })

    setTimeout(() => {
      const redirectUrl = getRedirectUrl()
      router.reLaunch(redirectUrl)
    }, 1500)

  } catch (err) {
    console.error('登录失败:', err)
    
    let errMsg = '登录失败，请重试'
    
    // 用户拒绝授权
    if (err?.errMsg?.includes('cancel') || err?.errMsg?.includes('deny')) {
      errMsg = '需要授权才能登录'
    } else if (err?.message) {
      errMsg = err.message
    }
    
    uni.showToast({
      title: errMsg,
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

// 用户协议
const handleAgreement = () => {
  uni.showToast({ title: '敬请期待', icon: 'none' })
}

// 隐私政策
const handlePrivacy = () => {
  uni.showToast({ title: '敬请期待', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.bg-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.bg-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  padding: 200rpx 60rpx 0;
}

.header {
  margin-bottom: 100rpx;
  
  .title {
    display: block;
    font-size: 56rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #999999;
  }
}

.login-content {
  margin-bottom: 60rpx;
}

.wx-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96rpx;
  background-color: #07C160;
  border-radius: 48rpx;
  border: none;
  
  .wx-icon {
    width: 44rpx;
    height: 44rpx;
    margin-right: 16rpx;
  }
  
  text {
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 500;
  }
  
  &:active {
    background-color: #06ad56;
  }
  
  &[disabled] {
    background-color: #a8e6c1;
  }
}

.footer {
  text-align: center;
  padding: 40rpx 0;
}

.agreement {
  font-size: 24rpx;
  color: #999999;
  
  .link {
    color: #E6212A;
  }
}
</style>
