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
}
