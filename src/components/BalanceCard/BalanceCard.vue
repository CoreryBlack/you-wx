<template>
  <view class="balance-card" :class="{ 'card-active': isActive }">
    <view class="card-header">
      <text class="card-title">{{ title }}</text>
      <text class="card-status" :class="statusClass">{{ statusText }}</text>
    </view>
    
    <view class="card-body">
      <view class="balance-wrapper">
        <text class="balance-label">余额</text>
        <text class="balance-value">
          <text class="currency">¥</text>
          {{ formatBalance }}
        </text>
      </view>
      
      <view class="card-no" v-if="cardNo">
        <text class="label">卡号：</text>
        <text class="value">{{ formatCardNo }}</text>
      </view>
    </view>
    
    <view class="card-footer" v-if="showActions">
      <slot name="actions">
        <view class="action-btn" @click="handleRecharge">充值</view>
        <view class="action-btn" @click="handleDetail">详情</view>
      </slot>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils'

// Props
const props = defineProps({
  // 卡片标题
  title: {
    type: String,
    default: '油卡'
  },
  // 卡号
  cardNo: {
    type: String,
    default: ''
  },
  // 余额（分）
  balance: {
    type: Number,
    default: 0
  },
  // 状态: active | inactive | expired
  status: {
    type: String,
    default: 'active'
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['recharge', 'detail'])

// 是否激活状态
const isActive = computed(() => props.status === 'active')

// 状态样式
const statusClass = computed(() => {
  return {
    'status-active': props.status === 'active',
    'status-inactive': props.status === 'inactive',
    'status-expired': props.status === 'expired'
  }
})

// 状态文字
const statusText = computed(() => {
  const map = {
    active: '正常',
    inactive: '未激活',
    expired: '已过期'
  }
  return map[props.status] || '未知'
})

// 格式化余额
const formatBalance = computed(() => {
  return formatMoney(props.balance)
})

// 格式化卡号（显示后4位）
const formatCardNo = computed(() => {
  if (!props.cardNo || props.cardNo.length < 4) return props.cardNo
  return '**** **** ' + props.cardNo.slice(-4)
})

// 充值
const handleRecharge = () => {
  emit('recharge')
}

// 详情
const handleDetail = () => {
  emit('detail')
}
</script>

<style lang="scss" scoped>
.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  color: #ffffff;
  margin: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
  
  &.card-active {
    background: linear-gradient(135deg, #E6212A 0%, #ff6b6b 100%);
    box-shadow: 0 10rpx 30rpx rgba(230, 33, 42, 0.3);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
}

.card-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.2);
  
  &.status-active {
    background-color: rgba(103, 194, 58, 0.3);
  }
  
  &.status-inactive {
    background-color: rgba(230, 162, 60, 0.3);
  }
  
  &.status-expired {
    background-color: rgba(245, 108, 108, 0.3);
  }
}

.card-body {
  margin-bottom: 30rpx;
}

.balance-wrapper {
  margin-bottom: 20rpx;
  
  .balance-label {
    font-size: 24rpx;
    opacity: 0.8;
  }
  
  .balance-value {
    display: block;
    font-size: 60rpx;
    font-weight: bold;
    margin-top: 10rpx;
    
    .currency {
      font-size: 36rpx;
      margin-right: 4rpx;
    }
  }
}

.card-no {
  font-size: 26rpx;
  opacity: 0.9;
  
  .label {
    opacity: 0.7;
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  padding-top: 20rpx;
}

.action-btn {
  padding: 10rpx 30rpx;
  font-size: 26rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
}
</style>
