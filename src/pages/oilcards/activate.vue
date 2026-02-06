<template>

	<view class="card">
		<view class="menu">
			<view class="item">
				<image src="/static/oilcards/gasoline.png"></image>
				<text>汽油</text>
				<view class="switch">
					<switch :checked="gasolineChecked" @change="onGasolineChange" color="#E6212A"></switch>
				</view>
			</view>
		</view>
	</view>

	<view class="card">
		<view class="menu">
			<view class="item">
				<image src="/static/oilcards/diesel.png"></image>
				<text>柴油</text>
				<view class="switch">
					<switch :checked="dieselChecked" @change="onDieselChange" color="#E6212A"></switch>
				</view>
			</view>
		</view>
	</view>

<!-- 	<button @click="close">关闭汽油卡</button> -->


</template>


<script>
	export default {
		components: {},
		data() {
			return {
				gasolineChecked: true,
				dieselChecked: false
			}
		},
		methods: {
			close() {
				this.gasolineChecked = false;
			},
			onGasolineChange(e) {
				this.gasolineChecked = e.detail.value
				this.change(e.detail.value)
			},
			onDieselChange(e) {
				this.dieselChecked = e.detail.value
				this.change(e.detail.value)
			},
			change(value) {
				var title = value ? '激活成功' : '卡已停用'
				uni.showToast({
					icon: 'none',
					title: title,
					duration: 1000
				})
			}
		}
	}
</script>

<style lang="scss">
	.card {
		background: #fff;
		box-sizing: border-box;
		width: 700rpx;
		margin: auto;
		margin-top: 20rpx;
		border: 3rpx solid #eef2fa;
		border-radius: 12rpx;
		padding: 15rpx;
		box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.15);

		.menu {

			.item {
				display: flex;
				height: 100rpx;
				align-items: center;
				padding: 0 20rpx;
				box-sizing: border-box;
				width: 700rpx;

				&:active {
					background: #f0f0f0;
				}

				image {
					height: 45rpx;
					width: 45rpx;
				}

				.switch {
					margin-left: auto;
					margin-right: 10rpx;
				}
				.arrow {
					width: 26rpx;
					height: 26rpx;
				}
			}
		}
	}
</style>