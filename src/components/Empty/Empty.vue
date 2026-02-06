<template>
  <view class="empty-container">
    <image
      class="empty-image"
      :src="imageSrc"
      mode="aspectFit"
    />
    <text class="empty-text">{{ text }}</text>
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 图片映射
const IMAGE_MAP = {
  default: '/static/empty/empty.png',
  truck: '/static/empty/truck.png',
  search: '/static/empty/search.png',
  network: '/static/empty/network.png',
  data: '/static/empty/data.png'
}

// Props
const props = defineProps({
  // 图片类型或自定义路径
  img: {
    type: String,
    default: 'default'
  },
  // 提示文字
  text: {
    type: String,
    default: '暂无数据'
  }
})

// 计算图片路径
const imageSrc = computed(() => {
  // 如果是自定义路径，直接返回
  if (props.img.startsWith('/') || props.img.startsWith('http')) {
    return props.img
  }
  // 否则从映射中获取
  return IMAGE_MAP[props.img] || IMAGE_MAP.default
})
</script>

<style lang="scss" scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  min-height: 60vh;
}

.empty-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
  text-align: center;
}
</style>
