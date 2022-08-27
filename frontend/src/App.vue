<template>
  <div>
    <button type="button" @click="onSignin">Signin With Metamask Wallet</button>
    <br>
    <br>
    <button type="button" @click="onGroupCreate">Create Group</button>
    <br>
    <br>
    <button type="button" @click="onGroupJoin">Join Group</button>
  </div>
</template>

<script lang="ts" setup>
import { Buffer } from 'buffer'
import { useFetch } from '@vueuse/core'
import { ref } from 'vue'
import crypto from 'crypto-js'

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

const address = ref('')
const token = ref('')

const reqNonce = async (address: string): Promise<string> => {
  const { data } = await useFetch(`http://localhost:5501/member/nonce/${address}`).get().json<ApiResponse<NonceRes>>()
  // TODO: 处理失败逻辑
  if (data.value) {
    return data.value.data.nonce
  }
  return ''
}

const reqSignature = async (address: string, data: string): Promise<string> => {
  const buff = Buffer.from(data, 'utf-8')
  const signature = await ethereum.request<string>({
    method: 'personal_sign',
    params: [buff.toString('hex'), address],
  })
  if (signature) {
    return signature
  }
  // TODO: 处理失败逻辑
  return ''
}

const reqSignin = async (req: SigninReq): Promise<string> => {
  const { data } = await useFetch('http://localhost:5501/member').post(req).json<ApiResponse<SigninRes>>()
  // TODO: 处理失败逻辑
  if (data.value) {
    return data.value.data.token
  }
  return ''
}

const onSignin = async () => {
  if (!ethereum) {
    // TODO: 此处不可用提示
    return
  }
  const accounts = (await ethereum.request<string[]>({ method: 'eth_requestAccounts' }) as string[])
  if (accounts?.length === 0) {
    // TODO: 处理登录失败
    return
  }
  // 获取选择账户
  [address.value] = accounts
  console.info('address:', address)
  // 获取随机码
  const nonce = await reqNonce(address.value)
  console.info('nonce:', nonce)
  // 对随机码进行签名
  const signature = await reqSignature(address.value, nonce)
  console.info('signature:', signature)
  // 登录获取token
  token.value = await reqSignin({
    address: address.value,
    nonce,
    signature,
  })
  console.info('token:', token.value)
}

const doSignout = () => {}

ethereum.on('accountsChanged', async params => {
  const accounts = params as string[]
  console.info('address changed:', accounts)
  if (accounts.length === 0) {
    // TODO: 用户断开钱包，直接退出到主页
    doSignout()
    // return
  }
  // TODO: 弹窗提示用户使用新钱包登录
  // onSignin()
})

type GroupCreateReq = {
  name: string
  category: string
  maxMembers: number
  intro?: string
  sharedPublic: string // 用户公钥
}

type GroupDetail = {
  address: string
  category: string
  intro: string
  membersMax: number
  name: string
  owner: boolean
  public: boolean
}

type GroupJoinReq = {
  groupId: string
  sharedPublic: string // 用户公钥
}

// TODO: 公钥和私钥需要保存在本地数据库中，在用户进入任意群时都需要检查该群的私钥是否存在，如果不存在则需要请求替换
// TODO: 一个群一个用户存一个key, 用户切换群或者浏览器时需要检查该群的key是否存在
type GroupDetailWithPublicKey = GroupDetail & {
  groupPublicKey: string // 待存储key
  keyId: string // group key 存储标识
}

const headerMemberAddress = 'X-Member-Address'
const headerSignature = 'X-Signature'
const headerTimestamp = 'X-Timestamp'

async function fetchSign<T> (payload: unknown, url: string): Promise<T | undefined> {
  const { data } = await useFetch(url, {
    async beforeFetch ({ options, cancel }) {
      const body = options.body?.toString()
      if (!token.value || !address.value || !body) {
        cancel()
        return undefined
      }
      // POST提交字符串 + 当前10位数字时间戳字符串
      const ts = Math.round(new Date().getTime() / 1000).toString()
      const str = crypto.MD5(body).toString() + ts
      const signature = await reqSignature(address.value, str)
      console.info(`str: ${str}, signature: ${signature}`)

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token.value}`,
        [headerMemberAddress]: address.value,
        [headerSignature]: signature,
        [headerTimestamp]: ts,
      }

      return {
        options,
      }
    },
  }).post(payload).json<ApiResponse<T>>()
  return data.value?.data
}

const onGroupCreate = async () => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  const req = {
    name: '测试群组',
    category: 'TEST',
    maxMembers: 10,
    sharedPublic: ecdhKeys.public,
  } as GroupCreateReq
  const res = await fetchSign<GroupDetailWithPublicKey>(req, 'http://localhost:5501/group')
  if (res && ecdhKeys) {
    ecdhKeys.id = res.keyId
    // 生成ECDH key
    console.info(res, ecdhKeys.private)
    ecdhKeys.shared = window.ecdhShare(res.groupPublicKey, ecdhKeys.private)
    // TODO: 需要存储 ecdhKeys
    console.info(ecdhKeys)
  }
}

const onGroupJoin = async () => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  const res = await fetchSign<GroupDetailWithPublicKey>({ groupId: '422915877898289152', sharedPublic: ecdhKeys.public } as GroupJoinReq, 'http://localhost:5501/group/join')
  if (res && ecdhKeys) {
    // 生成ECDH key
    console.info(res, ecdhKeys.private)
    ecdhKeys.shared = window.ecdhShare(res.groupPublicKey, ecdhKeys.private)
    // TODO: 需要存储 ecdhKeys
    console.info(ecdhKeys)
  }
}
</script>

<script lang="ts">
export default { name: 'AppVue' }
</script>
