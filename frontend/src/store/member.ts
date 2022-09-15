import { defineStore } from 'pinia'
import { ref } from 'vue'

export const memberStore = defineStore('counter', () => {
  // TODO: 测试数据需要删除
  const address = ref('0xf8fc2203874a6a97f9139d4ff05fb84a32497334')
  const token = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIweGY4ZmMyMjAzODc0YTZhOTdmOTEzOWQ0ZmYwNWZiODRhMzI0OTczMzQiLCJzdWIiOiIweGY4ZmMyMjAzODc0YTZhOTdmOTEzOWQ0ZmYwNWZiODRhMzI0OTczMzQiLCJleHAiOjE2NjMzNDU4NjQsImlhdCI6MTY2MzI1OTQ2NH0.IInS6xZ7Nm-_6GDriDbyWFAU936zFG4BeHk9kua1xig')

  const profile = ref({
    id: '425456631317266432',
    address: '0xf8fc2203874a6a97f9139d4ff05fb84a32497334',
  } as Profile)

  const $reset = () => {
    address.value = ''
    token.value = ''
    profile.value = {
      id: '',
      address: '',
    }
  }

  return { address, profile, token, $reset }
})
