import { createRouter, createWebHistory } from 'vue-router'
import { memberStore } from '@/store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/Home.vue') },
    { path: '/message', component: () => import('../views/Message.vue') },
  ],
})

router.beforeEach((to, from, next) => {
  const store = memberStore()
  if (to.path !== '/' && !store.token) {
    next({ path: '/' })
    return
  }
  next()
})

export default router
