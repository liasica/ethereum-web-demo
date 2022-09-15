<template>
  <div class="message">
    <InputSearch
      class="input"
      placeholder="输入消息"
      button-text="Send"
      search-button
      @search="onSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { useWebSocket } from '@vueuse/core'
import { memberStore } from '@/store'
import { watch } from 'vue'
import { Message, Operate } from '@/message'
import { InputSearch } from '@arco-design/web-vue'
import { useKeyDB } from '@/composables/db'

const store = memberStore()
// TODO: 测试groupID
const testGroupId = '425310913260683264'

const { send, status, data } = useWebSocket<Blob>(`${import.meta.env.VITE_WEBSOCKET_URL}/${store.address}`, {
  heartbeat: {
    message: '',
    interval: 30000,
  },
  autoReconnect: {
    retries: 10,
    delay: 1000,
    onFailed: () => {
      // TODO: 错误提示
    },
  },
})

const onSubmit = async (value: string) => {
  const groupKey = await useKeyDB()?.getKey(testGroupId)
  if (groupKey) {
    const b64 = window.ecdhEncrypt(groupKey.sharedKey, value)
    console.info(`encrypted data: ${b64}`)
    const data = window.ecdhDecrypt(groupKey.sharedKey, b64)
    console.info(`decrypted data: ${data}`)
  }
}

watch(
  () => data.value,
  async v => {
    if (v) {
      // TODO: 处理消息
      const data = await Message.fromBlob(v)
      console.info('WebSocket received message:', data)
    }
  },
)

watch(
  () => status.value,
  v => {
    console.info(`WebSocket: ${v}`)
    switch (v) {
      case 'OPEN':
        // 已连接，开始注册
        send((new Message(Operate.Register, store.token)).toArrayBuffer())
        break
      case 'CLOSED':
        // TODO: 关闭逻辑
        break
      default:
        break
    }
  },
)
</script>

<script lang="ts">
export default { name: 'MessageVue' }
</script>

<style lang="scss" scoped>
.message {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 20px;
}

.input {
  position: fixed;
  left: 20px;
  bottom: 20px;
  width: calc(100% - 40px);
}
</style>
