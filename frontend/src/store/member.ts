import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const memberStore = defineStore('counter', () => {
  // TODO: 测试数据需要删除
  const token = ref(import.meta.env.VITE_TEST_MEMBER_TOKEN || '')

  const profile = ref({
    id: import.meta.env.VITE_TEST_MEMBER_ID || '',
    address: import.meta.env.VITE_TEST_MEMBER_ADDRESS || '',
  } as Profile)

  const address = computed(() => profile.value.address)

  const $reset = () => {
    token.value = ''
    profile.value = {
      id: '',
      address: '',
    }
  }

  return { profile, token, address, $reset }
})
