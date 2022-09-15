import { memberStore } from '@/store'
import { useApiGet, useApiPost, useWalletSignature } from './request'

export const useAccount = async (): Promise<boolean> => {
  const store = memberStore()
  const accounts = (await window.ethereum.request<string[]>({ method: 'eth_requestAccounts' }) as string[])
  if (accounts?.length === 0) {
    // TODO: 处理登录失败
    return false
  }
  store.address = accounts[0] as string
  console.info('address:', store.address)
  return true
}

export const useMemberNonce = async (address: string): Promise<string> => {
  const res = await useApiGet<NonceRes>(`/member/nonce/${address}`)
  // TODO: 处理失败逻辑
  if (res) {
    return res.nonce
  }
  return ''
}

export const useMemberSignin = async (address: string): Promise<boolean> => {
  const nonce = await useMemberNonce(address)
  if (!nonce) {
    return false
  }

  const signature = await useWalletSignature(address, nonce)
  if (!signature) {
    return false
  }

  const res = await useApiPost<SigninRes, SigninReq>('/member', { address, nonce, signature })
  const store = memberStore()
  // TODO: 处理失败逻辑
  if (res?.token) {
    store.token = res.token
    store.profile = res.profile
    return true
  }
  return false
}
