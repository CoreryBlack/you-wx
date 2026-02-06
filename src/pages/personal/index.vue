<template>
  <view class="page">
    <!-- 用户信息区域 -->
    <view class="user-section">
      <image 
          :src="displayAvatar" 
          class="avatar"
          @click="handleAvatarClick"
        />
        <text class="username">{{ displayName }}</text>
      <view class="scan-btn" @click="handleScanClick">
        <image src="/static/publicres/ewm.png" class="scan-icon" />
        <text class="scan-text">会员码</text>
      </view>
    </view>

    <!-- 会员中心 -->
    <view class="member-section">
      <view class="member-header">
        <text class="member-title">会员中心</text>
        <text class="member-subtitle">立享多重权益</text>
      </view>
      
      <view class="member-stats">
        <view class="stat-item">
          <image src="/static/personal/crown-fill.png" class="stat-icon" />
          <text class="stat-label">会员权益</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.points || 0 }}</text>
          <text class="stat-label">会员积分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.coupons || 0 }}</text>
          <text class="stat-label">我的卡券</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.balance || 0 }}</text>
          <text class="stat-label">账户余额</text>
        </view>
      </view>
    </view>

    <!-- 我的服务 -->
    <view class="service-section">
      <text class="section-title">我的服务</text>
      <view class="service-list">
        <view
          v-for="item in services"
          :key="item.id"
          class="service-item"
          @click="handleServiceClick(item)"
        >
          <image :src="item.icon" class="service-icon" />
          <text class="service-name">{{ item.name }}</text>
          <text class="service-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section" v-if="userStore.isLoggedIn">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 底部导航 -->
    <TabBar :current-index="2" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TabBar from '@/components/TabBar/TabBar.vue'
import { useUserStore } from '@/store'
import { getUserInfo } from '@/api'
import { PAGES } from '@/constants'
import router from '@/utils/router'

// Store
const userStore = useUserStore()

// 用户信息
const userInfo = ref({
  points: 0,
  coupons: 0,
  balance: 0
})

// 临时用户（wx_temp_user）
const tempUser = ref(uni.getStorageSync('wx_temp_user') || null)

const displayName = computed(() => {
  if (userStore.userName && userStore.userName !== '未登录') return userStore.userName
  return (tempUser.value && (tempUser.value.nickName || tempUser.value.nickname)) || '未登录'
})

const displayAvatar = computed(() => {
  if (userStore.userAvatar && !userStore.userAvatar.includes('avatar.png')) return userStore.userAvatar
  return (tempUser.value && (tempUser.value.avatarUrl || tempUser.value.avatar_url)) || '/static/personal/avatar.png'
})

// 服务列表
const services = ref([
  { id: 1, name: '交易记录', icon: '/static/personal/solution.png', url: PAGES.TRANSACTIONS },
  { id: 2, name: '个人资料', icon: '/static/personal/idcard.png', url: '' },
  { id: 3, name: '帮助反馈', icon: '/static/personal/bug.png', url: '' },
  { id: 4, name: '系统设置', icon: '/static/personal/setting.png', url: '' }
])

// 加载用户数据
const loadUserData = async () => {
  // 如果已登录，优先用 token 拉取用户信息
  // 否则若存在临时 openId（小程序登录后需绑定手机号流程），用 openId 查询用户信息
  // 注意：如果刚刚通过 wx-login 登录成功且已包含完整信息，getUserInfo 依然可能被调用以更新积分余额等（如果接口支持）
  // 但如果用户指明不再需要 profile 接口，或者 profile 接口开销大，可以考虑仅在缺少信息时调用
  const tempOpenId = uni.getStorageSync('wx_temp_openId') || null
  if (!userStore.isLoggedIn && !tempOpenId) return

  try {
     // 如果已经有用户信息但没有积分等数据，可能仍需调用
     // 假设 getUserInfo 返回的是完整的 profile（含积分余额）
     // 按照用户指示"不再需要profile接口"，可能是指登录后不需要立即拉取。
     // 但作为个人中心，通常需要拉取最新的 assets (points, balance)。
     // 如果后端 wx-login 没返回 points/balance，这里还是需要的。
     // 但如果 wx-login 返回了 detailed info，且我们只想根据 store 显示，
     // 我们可以先用 store 数据渲染。
     
    // 只有当需要刷新数据时才调用（这里保持调用，但如果失败不影响显示）
    // 或者按照用户要求：若已有 userStore 数据，不再强制依赖此接口
    // 但为了积分余额，通常还是需要。
    // 如果用户明确说 "不再需要 profile 接口...直接用就可以"，
    // 可能是因为 wx-login 返回了所有需要展示的。
    // 如果 wx-login 没返回积分，那还是得查。
    // 鉴于用户只提供了 user/token/msg 和 "wx-login已经传入了用户很详细的信息"，
    // 我们这里可以加个判断：如果 store 里有足够信息，是否跳过？
    // 但通常个人中心 onShow 都是要刷新的。
    // 既然用户特意强调，可能 profile 接口有问题或者他是指登录流程里不要多余调用。
    // 我们保留这里的调用，但在出错时或数据不全时使用 store 兜底。
    
    // 修正：用户说 "不再需要 profile 接口"，可能是指 API 层面的移除？
    // 或者是指登录成功后 login.vue 不要 redirect 到 profile 获取？
    // login.vue 目前是 reLaunch 到 redirectUrl (通常是个人中心)，个人中心 onShow 调 loadUserData。
    // 既然用户这么说，我们把这里的 getUserInfo 调用改为：
    // 如果 store 里有数据，先用 store 的；然后静默刷新？
    // 或者完全移除？
    // 既然用户说 "直接用就可以"，那 updateUserInfo 那几行可能才是重点。
    
    // 我们先正常调用，但在登录页已经确保 storeUser 填入了详细信息。
    // 如果 backend profile 接口真的被移除了，这里会报错。
    // 假设 backend profile 接口还可以用（用于刷新），保留之。
    // 如果必须移除，则注释掉。
    // 你的指示是 "不再需要 profile 接口"，我将尝试仅在必要时调用，或者注释掉。
    // 但鉴于还有 points, coupons, balance，若 wx-login 没给，那还是得要。
    // 让我们假设 wx-login 也没给 points? 示例里没看到 points。
    // 无论如何，最稳妥的是：如果 fetch 失败，不影响显示。
    
    // 根据用户 "不再需要 profile 接口" 的强烈暗示，我将把这里的逻辑改为：
    // 如果已登录，直接使用 store 数据显示（假设 store 已更新），不再主动调用 getUserInfo
    // 除非 store 里缺数据。
    
    if (userStore.isLoggedIn) {
        // 使用 Store 中的数据更新本地展示状态 (points 等如果 store 没有则为 0)
        // 如果需要积分，可能得保留 API，或者 wx-login 也返回了
        const u = userStore.userInfo || {}
        userInfo.value = {
            points: u.points || 0,
            coupons: u.coupons || 0,
            balance: u.balance || 0
        }
        return // 不再调用接口
    }

    // 未登录但在绑定流程中，尝试用 OpenID 获取（如果后端支持）
    if (tempOpenId) {
       const res = await getUserInfo({ openId: tempOpenId })
       userInfo.value = {
         points: res.points || 0,
         coupons: res.coupons || 0,
         balance: res.balance || 0
       }
       userStore.updateUserInfo(res)
    }
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

// 头像点击
const handleAvatarClick = () => {
  if (!userStore.isLoggedIn) {
    router.push(PAGES.LOGIN)
  }
}

// 扫码点击
const handleScanClick = () => {
  router.push(PAGES.QRCODE)
}

// 服务项点击
const handleServiceClick = (item) => {
  if (item.url) {
    router.push(item.url)
  } else {
    uni.showToast({ title: '敬请期待', icon: 'none' })
  }
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        router.reLaunch(PAGES.LOGIN)
      }
    }
  })
}

// 生命周期
onMounted(() => {
  loadUserData()
})

onShow(() => {
  tempUser.value = uni.getStorageSync('wx_temp_user') || null
  loadUserData()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #E6212A 0%, #ff6b6b 100%);
  color: #ffffff;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  margin-right: 24rpx;
}

.username {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
}

.scan-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .scan-icon {
    width: 50rpx;
    height: 50rpx;
    margin-bottom: 8rpx;
  }
  
  .scan-text {
    font-size: 22rpx;
    opacity: 0.9;
  }
}

.member-section {
  margin: 20rpx;
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.member-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 30rpx;
  
  .member-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-right: 16rpx;
  }
  
  .member-subtitle {
    font-size: 24rpx;
    color: #999999;
  }
}

.member-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-icon {
    width: 48rpx;
    height: 48rpx;
    margin-bottom: 12rpx;
  }
  
  .stat-value {
    font-size: 36rpx;
    font-weight: bold;
    color: #E6212A;
    margin-bottom: 8rpx;
  }
  
  .stat-label {
    font-size: 24rpx;
    color: #666666;
  }
}

.service-section {
  margin: 20rpx;
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  display: block;
}

.service-list {
  margin-top: 20rpx;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: #fafafa;
  }
}

.service-icon {
  width: 44rpx;
  height: 44rpx;
  margin-right: 20rpx;
}

.service-name {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.service-arrow {
  font-size: 32rpx;
  color: #cccccc;
}

.logout-section {
  padding: 40rpx 30rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  color: #E6212A;
  background-color: #ffffff;
  border: 1rpx solid #E6212A;
  border-radius: 44rpx;
  
  &:active {
    background-color: #fff5f5;
  }
}
</style>
