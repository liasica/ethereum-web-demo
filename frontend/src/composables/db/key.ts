import Dexie, { Table } from 'dexie'

export interface GroupKey {
  id: string
  groupId: string
  publicKey: string
  privateKey: string
  sharedKey: string
}

export class GroupKeyDexie extends Dexie {
  keys!: Table<GroupKey>

  address!: string

  constructor (address: string) {
    super(address)

    this.address = address
    this.version(1).stores({
      keys: 'id, groupId',
    })
  }

  addKey (id: string, groupId: string, publicKey: string, privateKey: string, sharedKey: string) {
    this.keys.add({ id, groupId, publicKey, privateKey, sharedKey })
  }

  async getKey (groupId: string): Promise<GroupKey | undefined> {
    const res = await this.keys.get({ groupId })
    return res
  }
}
