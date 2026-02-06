<script>
import { useAppStore, useUserStore } from '@/store'
import { wxLogin } from '@/api'

export default {
  onLaunch() {
    console.log('App Launch')
    
    // 初始化系统信息
    const appStore = useAppStore()
    appStore.initSystemInfo()
    
    // 自动尝试登录
    const userStore = useUserStore()
    this.autoLogin(userStore)

    // 隐藏原生 tabBar
    this.hideTabBar()
  },
  onShow() {
    console.log('App Show')
    this.hideTabBar()
  },
  onHide() {
    console.log('App Hide')
  },
  methods: {
    // 自动登录
    async autoLogin(userStore) {
      try {
        const loginRes = await uni.login({ provider: 'weixin' })
        const code = Array.isArray(loginRes) ? loginRes[1]?.code : loginRes.code
        if (!code) return

        // 静默登录
        const res = await wxLogin({ code }, { silent: true }) // 传入 silent 禁止报错弹窗
        
        if (res && res.needBind) {
           // 仅更新临时信息，不跳转
           if (res.openId) uni.setStorageSync('wx_temp_openId', res.openId)
           const returnedUser = res.user || res.userInfo || res.data || null
           if (returnedUser) {
              const temp = {
                  nickName: returnedUser.nickname || returnedUser.nickName || '',
                  avatarUrl: returnedUser.avatar_url || returnedUser.avatarUrl || '',
                  phone: returnedUser.phone || ''
              }
              uni.setStorageSync('wx_temp_user', temp)
              userStore.setUserInfo(temp)
           }
           return
        }

        if (res && res.token) {
           const finalUser = res.user || res.userInfo || {}
           const storeUser = {
              ...finalUser,
              userId: finalUser.user_id || finalUser.userId || finalUser.id || '',
              nickName: finalUser.nickname || finalUser.nickName || '',
              avatarUrl: finalUser.avatar || finalUser.avatar_url || finalUser.avatarUrl || ''
           }
           userStore.login({
              token: res.token,
              userInfo: storeUser
           })
        }
      } catch (e) {
        console.warn('Silent login failed:', e)
      }
    },
    // 安全隐藏 TabBar
    hideTabBar() {
      try {
        if (typeof uni !== 'undefined' && typeof uni.hideTabBar === 'function') {
          uni.hideTabBar({
            fail: (err) => {
              // 忽略在非 TabBar 页面调用导致的失败
            }
          })
        }
      } catch (e) {
        // ignore
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/common.scss';
</style>