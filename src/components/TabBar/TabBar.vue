<template>
  <view class="tab-bar" :style="{ paddingBottom: safeAreaBottom }">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="handleTabClick(item, index)"
    >
      <!-- 普通图标 -->
      <template v-if="item.style === 0">
        <image
          class="tab-icon"
          :src="currentIndex === index ? item.selectedIconPath : item.iconPath"
          mode="aspectFit"
        />
      </template>
      
      <!-- 中间凸起图标 -->
      <template v-else>
        <view class="center-icon-wrapper">
          <image
            class="center-icon"
            :src="currentIndex === index ? item.selectedIconPath : item.iconPath"
            mode="aspectFit"
          />
        </view>
      </template>
      
      <!-- 文字 -->
      <text v-if="showText" class="tab-text">{{ item.name }}</text>
      
      <!-- 小圆点 -->
      <view v-else class="tab-dot" :class="{ 'dot-active': currentIndex === index }" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PAGES } from '@/constants'
import router from '@/utils/router'

// Props
const props = defineProps({
  // 当前选中的 Tab 索引
  currentIndex: {
    type: Number,
    default: 0
  },
  // 显示模式: 1-显示文字, 2-显示小圆点
  textType: {
    type: Number,
    default: 1
  }
})

// Emits
const emit = defineEmits(['change'])

// Tab 配置数据
const tabs = ref([
  {
    pageUrl: PAGES.INDEX,
    name: '首页',
    iconPath: '/static/tabBar/nabar1.png',
    selectedIconPath: '/static/tabBar/nabar1-a.png',
    style: 0
  },
  {
    pageUrl: PAGES.QRCODE,
    name: '码上付',
    iconPath: '/static/publicres/ewm.png',
    selectedIconPath: '/static/publicres/ewm.png',
    style: 1
  },
  {
    pageUrl: PAGES.PERSONAL,
    name: '我的',
    iconPath: '/static/tabBar/nabar2.png',
    selectedIconPath: '/static/tabBar/nabar2-a.png',
    style: 0
  }
])

// 是否显示文字
const showText = computed(() => props.textType === 1)

// 安全区域底部距离
const safeAreaBottom = ref('0px')

// 获取系统信息
onMounted(() => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    if (systemInfo.osName === 'ios') {
      safeAreaBottom.value = '34rpx'
    }
  } catch (e) {
    console.warn('获取系统信息失败:', e)
  }
})

// Tab 点击事件
const handleTabClick = (item, index) => {
  // 相同页面不跳转
  if (props.currentIndex === index) return

  emit('change', { item, index })

  // 如果是“我的”页，先检测是否登录；未登录则跳转到登录页并带上 redirect
  if (item.pageUrl === PAGES.PERSONAL) {
    if (!router.isLoggedIn()) {
      return router.push(`${PAGES.LOGIN}?redirect=${encodeURIComponent(item.pageUrl)}`)
    }
  }

  // 中间按钮使用 navigateTo
  if (item.style === 1) {
    router.push(item.pageUrl)
  } else {
    // 其他使用 reLaunch
    router.reLaunch(item.pageUrl)
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &.active {
    .tab-text {
      color: #E6212A;
    }
  }
}

.tab-icon {
  width: 50rpx;
  height: 50rpx;
}

.tab-text {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  transition: color 0.2s;
}

.tab-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #dddddd;
  margin-top: 10rpx;
  
  &.dot-active {
    background-color: #E6212A;
  }
}

.center-icon-wrapper {
  position: absolute;
  bottom: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #E6212A;
  border-radius: 50%;
  border: 10rpx solid #ffffff;
  box-shadow: 0 -10rpx 20rpx rgba(0, 0, 0, 0.1);
  
  .center-icon {
    width: 50rpx;
    height: 50rpx;
  }
}
</style>
