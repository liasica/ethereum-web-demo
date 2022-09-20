<template>
  <Space direction="vertical" size="large">
    <Button @click="onSignin">Signin With Metamask Wallet</Button>
    <Button @click="onJoinedGroupList">List Joined Group</Button>
    <Button @click="onGroupCreate">Create Group</Button>
    <Button @click="onGroupJoin">Join Group</Button>
    <Button @click="onGroupKeyShare">Share Key</Button>
    <Button type="primary" :disabled="!store.token" @click="() => router.push({ path: '/message' })">Open Group</Button>
  </Space>
</template>

<script lang="ts" setup>
import { useAccount, useMemberSignin } from '@/composables/api/member'
import { useGroupCreate, useGroupJoin, useGroupKeyShare, useJoinedGroupList } from '@/composables/api'
import { useKeyDB } from '@/composables/db'
import { memberStore } from '@/store/index'
import { Button, Space } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

const { ethereum } = window
const store = memberStore()
const router = useRouter()

// TODO: 测试groupId
const testGroupId = import.meta.env.VITE_TEST_GROUP_ID

const onSignin = async () => {
  await useAccount()
  await useMemberSignin(store.address)
  console.info(store.token)
  // 获取用户在该群的 groupKey
  const groupKey = await useKeyDB()?.getKey(testGroupId)
  console.info(groupKey)
}

const doSignout = () => {
  store.$reset()
}

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

const onJoinedGroupList = async () => {
  const groups = await useJoinedGroupList()
  console.info(groups)
}

const onGroupCreate = async () => {
  await useGroupCreate({
    name: '测试群组',
    category: 'TEST',
    maxMembers: 10,
  } as GroupCreateReq)
}

const onGroupJoin = async () => {
  await useGroupJoin(testGroupId)
}

const onGroupKeyShare = async () => {
  await useGroupKeyShare(testGroupId)
}
</script>

<script lang="ts">
export default { name: 'HomeVue' }
</script>
