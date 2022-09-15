import { memberStore } from '@/store'
import { GroupKeyDexie } from './key'

export const useKeyDB = (): GroupKeyDexie | undefined => {
  const store = memberStore()
  if (store.address) {
    const db = new GroupKeyDexie(store.address)
    return db
  }
  return undefined
}
