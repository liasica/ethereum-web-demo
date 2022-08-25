<template>
  <div>
    <button @click="onSignin">Signin With Metamask Wallet</button>
  </div>
</template>

<script lang="ts" setup>
import { Buffer } from 'buffer'
import { useFetch } from '@vueuse/core'
import { watch } from 'vue'

type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

type NonceRes = {
  nonce: string
}

type SigninRes = {
  token: string
}

type SigninReq = {
  address: string
  signature: string
  nonce: string
}

const { ethereum } = window

const reqNonce = async (address: string): Promise<string> => {
  const { data } = await useFetch(`http://localhost:5501/member/nonce/${address}`).get().json<ApiResponse<NonceRes>>()
  // TODO: 处理失败逻辑
  return data.value!.data.nonce
}

const reqSignature = async (address: string, nonce: string): Promise<string> => {
  const buff = Buffer.from(nonce, "utf-8");
  const signature = await ethereum.request<string>({
    method: 'personal_sign',
    params: [ buff.toString('hex'), address],
  })
  return signature!
}

const reqSignin = async (req: SigninReq): Promise<string> => {
  const { data } = await useFetch('http://localhost:5501/member').post(req).json<ApiResponse<SigninRes>>()
  // TODO: 处理失败逻辑
  return data.value!.data.token
}

const onSignin = async () => {
  if (!ethereum)  {
    // TODO: 此处不可用提示
    return
  }
  const accounts = await ethereum.request<string[]>({ method: 'eth_requestAccounts' })
  // 获取选择账户
  const address = accounts![0]!
  console.info('address:', address)
  // 获取随机码
  const nonce = await reqNonce(address)
  console.info('nonce:', nonce)
  // 对随机码进行签名
  const signature = await reqSignature(address, nonce)
  console.info('signature:', signature)
  // 登录获取token
  const token = await reqSignin({
    address: address,
    nonce: nonce,
    signature: signature,
  })
  console.info('token:', token)
}

ethereum.on('accountsChanged', async (params) => {
  const accounts = params as string[]
  console.info('address changed:', accounts)
  if (accounts.length == 0) {
    // TODO: 用户断开钱包，直接退出到主页
    return
  }
  // TODO: 弹窗提示用户使用新钱包登录
  onSignin()
})
</script>

<script lang="ts">
export default { name: 'AppVue' }
</script>
