import { address } from '@/composables/member'
import { GroupKeyDexie } from './key'

export const useKeyDB = (): GroupKeyDexie | undefined => {
  if (address.value) {
    const db = new GroupKeyDexie(address.value)
    return db
  }
  return undefined
}
