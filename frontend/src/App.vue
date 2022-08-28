<template>
  <div>
    <button type="button" @click="onSignin">Signin With Metamask Wallet</button>
    <br>
    <br>
    <button type="button" @click="onGroupCreate">Create Group</button>
    <br>
    <br>
    <button type="button" @click="onGroupJoin">Join Group</button>
    <br>
    <br>
    <button type="button" @click="onGroupKeyShare">Share Key</button>
  </div>
</template>

<script lang="ts" setup>
import { useAccount, useMemberSignin } from '@/composables/api/member'
import { address, token } from '@/composables/member'
import { GroupCreateReq, useGroupCreate, useGroupJoin, useGroupKeyShare } from '@/composables/api'
import { useKeyDB } from './composables/db'

const { ethereum } = window

const testGroupId = '423032862455889920'

const onSignin = async () => {
  await useAccount()
  await useMemberSignin(address.value)
  const groupKey = await useKeyDB()?.getKey(testGroupId)
  console.info(groupKey)
}

const doSignout = () => {
  token.value = ''
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
export default { name: 'AppVue' }
</script>
