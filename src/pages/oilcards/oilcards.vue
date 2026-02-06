<template>
  <view class="page">
    <!-- 空状态 -->
    <Empty
      v-if="isEmpty"
      img="truck"
      text="您当前还没有加油卡，赶紧前往激活吧！"
    >
      <button class="activate-btn" @click="handleActivate">
        立即激活
      </button>
    </Empty>

    <!-- 油卡列表 -->
    <view v-else class="card-list">
      <!-- Tab 切换 -->
      <view class="tabs">
        <view
          v-for="(item, index) in cardList"
          :key="item.id"
          class="tab-item"
          :class="{ active: currentIndex === index }"
          @click="handleTabChange(index)"
        >
          {{ item.name }}
        </view>
      </view>

      <!-- 当前卡片 -->
      <BalanceCard
        v-if="currentCard"
        :title="currentCard.name"
        :card-no="currentCard.cardNo"
        :balance="currentCard.balance"
        :status="currentCard.status"
        @recharge="handleRecharge"
        @detail="handleDetail"
      />

      <!-- 交易记录（已移除，使用通用交易页查看） -->
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store'
import Empty from '@/components/Empty/Empty.vue'
import BalanceCard from '@/components/BalanceCard/BalanceCard.vue'
import { getOilCards } from '@/api'
import { PAGES } from '@/constants'
import { formatMoney } from '@/utils'
import router from '@/utils/router'

// 数据
const userStore = useUserStore()
const cardList = ref([])
// transactions removed: oil-specific transaction API is deprecated
const currentIndex = ref(0)
const loading = ref(false)

// 是否为空
const isEmpty = computed(() => cardList.value.length === 0)

// 当前选中的卡片
const currentCard = computed(() => {
  return cardList.value[currentIndex.value] || null
})

// 格式化金额
const formatAmount = (amount) => {
  return formatMoney(amount)
}

// 获取油卡列表
const fetchCards = async () => {
  loading.value = true
  try {
    // 接口返回的是数据数组 (http interceptor 处理了 code=0)
    // 如果返回 { list: [] } 则 res.list，如果是直接数组则 res
    // 支持按用户ID查询
    const params = {}
    if (userStore.userInfo && (userStore.userInfo.userId || userStore.userInfo.id)) {
        params.user_id = userStore.userInfo.userId || userStore.userInfo.id
    }
    const res = await getOilCards(params)
    // 后端返回字段示例: { cardNo, cardType, balanceCents, status, createTime, updateTime }
    const rawList = Array.isArray(res) ? res : (res.list || [])
    const typeMap = { 1: '汽油', 2: '柴油' }
    const statusMap = { 1: 'active', 2: 'inactive', 3: 'expired' }

    cardList.value = rawList.map(item => ({
      // 保持与现有页面字段一致: name / cardNo / balance / status / id
      id: item.cardNo || item.id,
      name: `${typeMap[item.cardType] ? typeMap[item.cardType] + '卡' : '油卡'}`,
      cardNo: item.cardNo,
      // BalanceCard 和 formatMoney 期望传入的是“分”单位的数字
      balance: typeof item.balanceCents === 'number' ? item.balanceCents : (item.balance || 0),
      // 转换为组件可识别的状态字符串
      status: statusMap[item.status] || (item.status === 1 ? 'active' : 'inactive'),
      // 原始字段备份
      raw: item
    }))
  } catch (e) {
    console.error('获取油卡列表失败:', e)
  } finally {
    loading.value = false
  }
}

// oil-specific transactions endpoint removed; use通用交易页面查看明细或后端新接口

// Tab 切换
const handleTabChange = (index) => {
  currentIndex.value = index
}

// 去激活
const handleActivate = () => {
  router.push(PAGES.OIL_ACTIVATE)
}

// 充值
const handleRecharge = () => {
  uni.showToast({ title: '敬请期待', icon: 'none' })
}

// 查看详情
const handleDetail = () => {
  if (!currentCard.value) return
  // 可跳转到详情页
  uni.showToast({ title: '敬请期待', icon: 'none' })
}

// 生命周期
onMounted(() => {
  fetchCards()
})

// 页面显示时刷新
defineExpose({
  onShow() {
    fetchCards()
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.activate-btn {
  width: 300rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  color: #ffffff;
  background-color: #E6212A;
  border-radius: 44rpx;
  border: none;
  
  &:active {
    background-color: #cc1d26;
  }
}

.card-list {
  padding: 20rpx;
}

.tabs {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 10rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666666;
  border-radius: 12rpx;
  transition: all 0.3s;
  
  &.active {
    color: #E6212A;
    background-color: rgba(230, 33, 42, 0.1);
    font-weight: bold;
  }
}

.transactions {
  margin-top: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  display: block;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.trans-info {
  flex: 1;
  
  .trans-desc {
    font-size: 28rpx;
    color: #333333;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .trans-time {
    font-size: 24rpx;
    color: #999999;
  }
}

.trans-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  
  &.positive {
    color: #67C23A;
  }
}
</style>
