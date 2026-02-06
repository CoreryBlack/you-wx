<template>
  <view class="page">
    <!-- 顶部 Banner -->
    <view class="banner">
      <image 
        src="/static/index/indextop.png" 
        mode="widthFix" 
        class="banner-image"
      />
    </view>

    <!-- 功能入口 -->
    <view class="tools-grid">
      <view
        v-for="tool in tools"
        :key="tool.id"
        class="tool-item"
        @click="handleToolClick(tool)"
      >
        <image :src="tool.icon" class="tool-icon" />
        <text class="tool-name">{{ tool.name }}</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <TabBar :current-index="0" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import TabBar from '@/components/TabBar/TabBar.vue'
import { PAGES } from '@/constants'
import router from '@/utils/router'

// 功能入口配置
const tools = ref([
  {
    id: 1,
    name: '我的油卡',
    icon: '/static/index/oil_card.png',
    url: PAGES.OIL_CARDS
  },
  {
    id: 2,
    name: '交易记录',
    icon: '/static/index/record.png',
    url: PAGES.TRANSACTIONS
  },
  {
    id: 3,
    name: '领券中心',
    icon: '/static/index/voucher.png',
    url: ''
  },
  {
    id: 4,
    name: '积分商城',
    icon: '/static/index/mall.png',
    url: ''
  }
])

// 功能点击事件
const handleToolClick = (tool) => {
  if (tool.url) {
    router.push(tool.url)
  } else {
    uni.showToast({
      title: '敬请期待',
      icon: 'none',
      duration: 1500
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.banner {
  width: 100%;
  
  .banner-image {
    width: 100%;
    display: block;
  }
}

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 30rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 1;
}

.tool-item {
  width: 23%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 20rpx;
  
  &:active {
    background-color: #f9f9f9;
    transform: scale(0.98);
  }
}

.tool-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 16rpx;
}

.tool-name {
  font-size: 26rpx;
  color: #333333;
  text-align: center;
}
</style>
