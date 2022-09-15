import { defineStore } from 'pinia'
import { ref } from 'vue'

export const memberStore = defineStore('counter', () => {
  // TODO: 测试数据需要删除
  const address = ref('0xf8fc2203874a6a97f9139d4ff05fb84a32497334')
  const token = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIweGY4ZmMyMjAzODc0YTZhOTdmOTEzOWQ0ZmYwNWZiODRhMzI0OTczMzQiLCJzdWIiOiIweGY4ZmMyMjAzODc0YTZhOTdmOTEzOWQ0ZmYwNWZiODRhMzI0OTczMzQiLCJleHAiOjE2NjMzMDE5NDgsImlhdCI6MTY2MzIxNTU0OH0.FmGzDnJ23MK0yiiZ_1We8z7LHWfboPKMTInOKaT-Oh8')

  const $reset = () => {
    address.value = ''
    token.value = ''
  }

  return { address, token, $reset }
})
