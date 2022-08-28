import { address, token } from '../member'
import { useApiGet, useApiPost, useWalletSignature } from './request'

export interface NonceRes {
  nonce: string
}

export interface SigninReq {
  address: string
  signature: string
  nonce: string
}

export interface SigninRes {
  token: string
}

export const useAccount = async (): Promise<boolean> => {
  const accounts = (await window.ethereum.request<string[]>({ method: 'eth_requestAccounts' }) as string[])
  if (accounts?.length === 0) {
    // TODO: 处理登录失败
    return false
  }
  address.value = accounts[0] as string
  console.info('address:', address.value)
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
  // TODO: 处理失败逻辑
  if (res?.token) {
    token.value = res.token
    return true
  }
  return false
}
