<template>
  <view class="page">
    <view class="header">
      <text class="title">交易记录</text>
    </view>

    <view class="list">
      <view v-for="item in viewList" :key="item.id || item.txnId || item.orderId" class="txn-card">
        <view class="card-head">
          <view class="id-wrap">
            <text class="id-label">订单</text>
            <text class="id-value">{{ item.txnIdShort || item.txnId || item.orderId || item.id || '' }}</text>
          </view>
          <text class="status" :class="statusClass(item)">{{ item.statusDesc }}</text>
        </view>
        <view class="card-mid" style="justify-content: flex-end">
          <text class="time">{{ item.createTime }}</text>
        </view>
        <view class="card-foot">
          <text class="type-chip">{{ item.typeLabel || item.typeDesc || item.type || '' }}</text>
          <text class="amount">{{ item.amountStr || (item.amount ? `¥${Number(item.amount).toFixed(2)}` : '') }}</text>
        </view>
      </view>

        <view v-if="list.length===0 && !needLogin" class="empty">暂无交易记录</view>
        <view v-if="needLogin" class="empty">
          <text>请先登录以查看你的交易记录</text>
          <button @click="goLogin" style="margin-top:20rpx">去登录</button>
        </view>
    </view>

    <view class="footer">
      <button @click="loadMore" v-if="hasMore">加载更多</button>
      <text v-else>已加载全部</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTransactions } from '@/api/modules/transactions'
import { parseTransactionsApiRes } from '@/utils/transactionsParser'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const list = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const loading = ref(false)
const needLogin = ref(false)

const user_id = computed(() => {
  // 支持多种后端字段映射：userId / user_id / id
  const info = userStore.userInfo || {}
  const uid = info.userId || info.user_id || info.id || null
  if (uid) return uid
  // 尝试读取临时用户（绑定流程）可能包含 user_id 或 userId
  const tmp = uni.getStorageSync('wx_temp_user') || null
  if (tmp) return tmp.user_id || tmp.userId || tmp.id || null
  return null
})

const load = async (reset = false) => {
  if (loading.value) return

  // 强校验：必须有 user_id 才请求接口，避免返回其他用户数据
  if (!user_id.value) {
    needLogin.value = true
    return
  }

  loading.value = true
  try {
    if (reset) {
      page.value = 1
      list.value = []
    }
    const res = await getTransactions({ user_id: user_id.value, page: page.value, limit: limit.value })
    const payload = res && res.data ? res.data : res
    const records = Array.isArray(payload) ? payload : (payload.records || payload.list || [])
    const normalized = records.map(normalizeItem)
    if (reset) {
      list.value = normalized
    } else {
      list.value = list.value.concat(normalized)
    }
    total.value = payload.total ?? payload.count ?? payload.totalCount ?? (payload.totalPages ? (payload.total || records.length) : (payload.total || records.length || 0))
  } catch (e) {
    console.error('加载交易记录失败', e)
  } finally {
    loading.value = false
  }
}

const hasMore = computed(() => list.value.length < (total.value || 0))

const viewList = computed(() => list.value)

function normalizeItem(r) {
  const orderId = r.orderId || r.order_id || ''
  const txnId = r.txnId || r.txn_id || r.id || ''
  const amountCents = r.amountCents ?? r.amount_cents ?? r.amount ?? 0
  const typeDesc = r.typeLabel || r.typeDesc || r.type_desc || r.typeName || ''
  const typeLabel = mapTypeLabel(r, typeDesc)
  // 处理 cardNo 可能被误填为 txnId/orderId 的情况，避免重复显示两个省略块
  const rawCard = r.cardNo || r.card_no || ''
  const normalizedCard = (rawCard && String(rawCard)) || ''
  const showCard = normalizedCard && normalizedCard !== String(txnId) && normalizedCard !== String(orderId)

  return {
    ...r,
    orderIdShort: r.orderIdShort || abbrevOrderId(orderId || txnId),
    txnIdShort: r.txnIdShort || abbrevOrderId(txnId || orderId),
    cardNoMasked: r.cardNoMasked || (showCard ? maskCardNo(normalizedCard) : ''),
    amountStr: r.amountStr || formatMoneyStr(amountCents),
    typeLabel,
    createTime: r.createTime || formatDateTime(r.create_time || r.created_at || r.createTime),
    statusDesc: r.statusDesc || statusText(r.status)
  }
}

function formatMoneyFromCents(cents) {
  const n = Number(cents) || 0
  return Number((n / 100).toFixed(2))
}

function formatMoneyStr(cents) {
  return `¥${formatMoneyFromCents(cents).toFixed(2)}`
}

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return String(iso)
  const pad = (v) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function maskCardNo(no) {
  if (!no) return ''
  const s = String(no)
  const last = s.slice(-4)
  if (!last) return ''
  return `****...${last}`
}

function statusText(status) {
  if (status === 1) return '成功'
  if (status === 0) return '失败'
  return status == null ? '' : String(status)
}

function statusClass(item) {
  if (!item) return ''
  if (item.status === 1) return 'is-success'
  if (item.status === 0) return 'is-fail'
  return 'is-pending'
}

function mapTypeLabel(r, text) {
  const t = (text || '').toString()
  if (/充值/.test(t)) return '油卡充值'
  if (/退款/.test(t)) return '退款'
  if (/积分/.test(t) && /增|增加/.test(t)) return '积分增加'
  if (/积分/.test(t) && /消|消费/.test(t)) return '积分消费'
  if (/支出|消费/.test(t)) return '支出'

  const n = Number(r.type)
  switch (n) {
    case 1: return '油卡充值'
    case 2: return '油卡充值'
    case 3: return '支出'
    case 4: return '积分增加'
    case 5: return '积分消费'
    case 6: return '退款'
    default: return t || (Number.isFinite(n) ? String(n) : '其他')
  }
}

function abbrevOrderId(id) {
  if (!id) return ''
  const s = String(id)
  if (s.length <= 10) return s
  const first = s.slice(0, 6)
  const last = s.slice(-4)
  return `${first}...${last}`
}

const loadMore = () => {
  if (!hasMore.value) return
  page.value += 1
  load()
}

const goLogin = () => {
  // 跳转到登录页
  const { PAGES } = require('@/constants')
  // 使用 router.push
  const router = require('@/utils/router').default
  router.push(PAGES.LOGIN)
}

onMounted(() => {
  console.log('[transactions] mounted, userStore.userInfo=', userStore.userInfo)
  console.log('[transactions] computed user_id=', user_id.value)
  load(true)
})

onShow(() => {
  console.log('[transactions] onShow, userStore.userInfo=', userStore.userInfo)
  console.log('[transactions] onShow computed user_id=', user_id.value)
  // 重新尝试加载（登录可能在别处完成后返回本页）
  load(true)
})
</script>

<style scoped>
.page { padding: 20rpx; background: #f5f5f5; min-height: 100vh }
.header { padding: 20rpx 0 }
.title { font-size: 32rpx; font-weight: bold }
.list { margin-top: 10rpx }
.empty { text-align: center; color: #999; padding: 80rpx 0 }
.footer { text-align: center; padding: 24rpx }

.txn-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 14rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

.card-head,
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.id-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  max-width: 70%;
}

.id-label {
  font-size: 22rpx;
  color: #999;
  background: #f6f6f6;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
}

.id-value {
  font-size: 24rpx;
  color: #333;
  max-width: 260rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #f0f0f0;
  color: #666;
}
.status.is-success { background: #e9f7ef; color: #1e8e3e }
.status.is-fail { background: #fdecec; color: #d93025 }
.status.is-pending { background: #fff7e6; color: #b26a00 }

.card-mid {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-no {
  font-size: 26rpx;
  color: #555;
}

.time {
  font-size: 22rpx;
  color: #999;
}

.card-foot {
  margin-top: 14rpx;
}

.type-chip {
  font-size: 22rpx;
  color: #4a4a4a;
  background: #f5f7ff;
  padding: 6rpx 12rpx;
  border-radius: 10rpx;
}

.amount {
  font-size: 30rpx;
  font-weight: 700;
  color: #E6212A;
}
</style>
