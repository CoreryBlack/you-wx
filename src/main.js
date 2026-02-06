/**
 * 应用入口（src 目录）
 */
import App from './App.vue'

// #ifdef VUE3
import { createSSRApp } from 'vue'
import pinia from './store'
import uView from '@root/uni_modules/uview-next'

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  app.use(uView)
  return { app }
}
// #endif

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import uView from '@root/uni_modules/uview-next'

Vue.config.productionTip = false
Vue.use(uView)

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif
