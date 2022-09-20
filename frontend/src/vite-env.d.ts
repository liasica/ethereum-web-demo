/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare type ECDHKeys = {
  publicKey: string
  privateKey: string
}

interface Window {
  ethereum: import('@metamask/providers').MetaMaskInpageProvider
  ecdhGenerate: () => ECDHKeys
  ecdhShare: (othersPublicKey: string, privateKey: string) => string
  ecdhEncrypt: (sharedKey: string, data: string) => string
  ecdhDecrypt: (privateKey: string, data: string) => string
}

interface ImportMetaEnv {
  VITE_BASE_API_URL: string
  VITE_WEBSOCKET_URL: string
  VITE_TEST_MEMBER_ID: string
  VITE_TEST_MEMBER_TOKEN: string
  VITE_TEST_GROUP_ID: string
  VITE_TEST_MEMBER_ADDRESS: string
}
