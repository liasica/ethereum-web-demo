import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@arco-design/web-vue/dist/arco.css'
import './style.scss'

import App from './App.vue'
import router from './router'

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')
