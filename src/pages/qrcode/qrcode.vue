<template>
	<view class="page">
		<view class="header">
			<text class="title">会员码</text>
		</view>

		<view class="card">
			<view class="avatar-wrap">
				<image :src="userAvatar" class="avatar" mode="cover" />
				<text class="name">{{ userName }}</text>
			</view>

			<view class="qrcode-wrap">
				<image v-if="qrUrl" :src="qrUrl" class="qr-image" mode="widthFix" />
				<view v-else class="qr-placeholder">{{ loading ? '加载中…' : (error || '暂无会员码') }}</view>
			</view>

			<view class="code-text">{{ codeValueDisplay }}</view>
			<view class="actions">
				<button @click="fetchMemberCode" :disabled="loading">刷新</button>
				<text v-if="lastUpdated" class="updated">上次：{{ new Date(lastUpdated).toLocaleString() }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store'
import { getUserInfo, getMemberCode } from '@/api/modules/user'

const REFRESH_INTERVAL = 60 * 1000 // 60s fallback
const REFRESH_BUFFER = 5 * 1000 // 在到期前多少毫秒刷新一次
const MIN_REFRESH = 5 * 1000 // 最小刷新间隔

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo || {})
const userName = computed(() => userStore.userName || userInfo.value.nickName || userInfo.value.phone || '未登录')
const userAvatar = computed(() => userStore.userAvatar || userInfo.value.avatar || '/static/personal/avatar.png')

const codeValue = computed(() => {
	return userInfo.value.memberCode || userInfo.value.code || userInfo.value.id || userInfo.value.userId || userInfo.value.openId || userInfo.value.phone || ''
})

const codeValueDisplay = computed(() => codeValue.value ? String(codeValue.value) : '未绑定会员码')

const qrUrl = ref('')
const loading = ref(false)
const error = ref('')
const lastUpdated = ref(null)
let timer = null

async function fetchMemberCode() {
	if (!codeValue.value) return
	loading.value = true
	error.value = ''
	try {
		// 传 user identifier，以便后端绑定或生成特定会员码
		const res = await getMemberCode({ user_id: codeValue.value })
		const payload = res && res.data ? res.data : res
		// 支持多种后端字段：url / qrUrl / image / base64
		let url = payload.url || payload.qrUrl || payload.image || payload.data || ''
		if (!url && payload.base64) {
			url = `data:image/png;base64,${payload.base64}`
		}
		// 如果后端直接返回一个 code 字符串，使用静态生成器作为回退
		if (!url && payload.code) {
			const data = encodeURIComponent(String(payload.code))
			url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}`
		}
		// 最后回退：使用本地 codeValue
		if (!url) {
			const data = encodeURIComponent(String(codeValue.value))
			url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}`
		}
		qrUrl.value = url
		lastUpdated.value = Date.now()

		// 计算下一次刷新间隔：优先使用后端返回的 expires/expiredAt/ttl 等字段
		let nextDelay = REFRESH_INTERVAL
		try {
			const payloadKeys = ['expiresAt','expires_at','expireAt','expire_at','expires','expire','ttl','expiresIn','expires_in']
			let expiresRaw = null
			for (const k of payloadKeys) {
				if (Object.prototype.hasOwnProperty.call(payload, k) && payload[k] != null) {
					expiresRaw = payload[k]
					break
				}
			}
			if (expiresRaw != null) {
				let expiresMs = null
				if (typeof expiresRaw === 'number') {
					// 可能是秒或毫秒
					expiresMs = expiresRaw > 1e12 ? expiresRaw : (expiresRaw > 1e10 ? expiresRaw : expiresRaw * 1000)
				} else if (typeof expiresRaw === 'string') {
					const asNum = Number(expiresRaw)
					if (!isNaN(asNum)) {
						expiresMs = asNum > 1e12 ? asNum : asNum * 1000
					} else {
						const parsed = Date.parse(expiresRaw)
						if (!isNaN(parsed)) expiresMs = parsed
					}
				}
				// 如果字段名是 ttl（过期秒数），将其转为时间戳
				if (!expiresMs && payload.ttl) {
					const ttl = Number(payload.ttl)
					if (!isNaN(ttl)) expiresMs = Date.now() + ttl * 1000
				}
				if (expiresMs) {
					const delay = Math.max(MIN_REFRESH, expiresMs - Date.now() - REFRESH_BUFFER)
					nextDelay = delay
				}
			}
		} catch (err) {
			console.warn('解析 expiresAt 失败，使用默认间隔', err)
		}

		scheduleNextRefresh(nextDelay)
	} catch (e) {
		console.error('获取会员码失败', e)
		error.value = '获取会员码失败'
	} finally {
		loading.value = false
	}
}

function scheduleNextRefresh(ms) {
	stopAutoRefresh()
	// 使用 setTimeout 以便支持动态间隔
	timer = setTimeout(() => {
		fetchMemberCode()
	}, Math.max(MIN_REFRESH, ms || REFRESH_INTERVAL))
}

function stopAutoRefresh() {
	if (timer) {
		clearTimeout(timer)
		timer = null
	}
}

onMounted(async () => {
	if (!userInfo.value || Object.keys(userInfo.value).length === 0) {
		try {
			const res = await getUserInfo()
			if (res && res.data) {
				userStore.setUserInfo(res.data || res)
			}
		} catch (e) {
			console.warn('拉取用户信息失败', e)
		}
	}

	// 首次获取，fetchMemberCode 内会根据后端返回的 expiresAt 安排下一次刷新
	await fetchMemberCode()
})

onUnmounted(() => {
	stopAutoRefresh()
})
</script>

<style scoped>
.page { padding: 20rpx; background: #f5f5f5; min-height: 100vh }
.header { padding: 12rpx 0 }
.title { font-size: 32rpx; text-align: center; font-weight: 700 }
.card { background: #fff; border-radius: 16rpx; padding: 30rpx 20rpx; margin-top: 20rpx; align-items: center }
.avatar-wrap { display: flex; flex-direction: column; align-items: center }
.avatar { width: 160rpx; height: 160rpx; border-radius: 80rpx }
.name { margin-top: 14rpx; font-size: 30rpx; color: #333; font-weight: 600 }
.qrcode-wrap { margin-top: 26rpx; display:flex; align-items:center; justify-content:center }
.qr-image { width: 420rpx; height: 420rpx; border-radius: 12rpx }
.qr-placeholder { width: 420rpx; height: 420rpx; display:flex; align-items:center; justify-content:center; background:#fafafa; color:#999; border-radius:12rpx; font-size: 28rpx }
.code-text { margin-top: 14rpx; color: #666; font-size: 24rpx; word-break: break-all; text-align: center }
.actions { margin-top: 16rpx; display:flex; align-items:center; justify-content:center; gap: 16rpx }
.actions button { padding: 10rpx 22rpx; font-size: 26rpx }
.updated { color:#999; font-size:20rpx }
</style>