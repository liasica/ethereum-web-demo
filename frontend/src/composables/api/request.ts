import { createFetch } from '@vueuse/core'
import crypto from 'crypto-js'
import { Buffer } from 'buffer'
import { token, address } from '@/composables/member'
import { headerMemberAddress, headerSignature, headerTimestamp } from './header'

export const baseUrl = 'http://localhost:5501'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export const useWalletSignature = async (address: string, data: string): Promise<string> => {
  const buff = Buffer.from(data, 'utf-8')
  const signature = await window.ethereum.request<string>({
    method: 'personal_sign',
    params: [buff.toString('hex'), address],
  })
  if (signature) {
    return signature
  }
  // TODO: 处理失败逻辑
  return ''
}

export const useApiFetch = (url: string, sign?: boolean) => createFetch({
  baseUrl,
  options: {
    async beforeFetch ({ options }) {
      // 如果已登录
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
          [headerMemberAddress]: address.value,
        }
      }
      const body = options.body?.toString()
      if (options.method === 'POST' && sign && body) {
        // POST提交字符串 + 当前10位数字时间戳字符串
        const ts = Math.round(new Date().getTime() / 1000).toString()
        const str = crypto.MD5(body).toString() + ts
        const signature = await useWalletSignature(address.value, str)
        console.info(`str: ${str}, signature: ${signature}`)
        options.headers = {
          ...options.headers,
          [headerSignature]: signature,
          [headerTimestamp]: ts,
        }
      }

      return { options }
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})(url)

export const useApiGet = async <T, > (url: string): Promise<T | undefined> => {
  const { data } = await useApiFetch(url).get().json<ApiResponse<T>>()
  // TODO: 处理返回失败
  console.info(data.value)
  return data.value?.data
}

export const useApiPost = async <T, P = unknown> (url: string, payload: P, sign?: boolean): Promise<T | undefined> => {
  const { data } = await useApiFetch(url, sign).post(payload).json<ApiResponse<T>>()
  // TODO: 处理返回失败
  console.info(data.value)
  return data.value?.data
}
