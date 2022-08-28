import { GroupKeyDexie } from './key'

export const db = (address: string) => new GroupKeyDexie(address)
