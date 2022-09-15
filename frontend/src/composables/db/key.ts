import Dexie, { Table } from 'dexie'

export interface GroupKey {
  id: string
  groupId: string
  publicKey: string
  privateKey: string // 消息通过私钥解密
  sharedKey: string // 通过用户私钥和群组公钥椭圆计算得出的共享密钥，所有消息都是用此密钥加密传输
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

  async addKey (id: string, groupId: string, publicKey: string, privateKey: string, sharedKey: string) {
    // if group id exists, delete it first
    const exists = await this.getKey(groupId)
    if (exists) {
      await this.keys.delete(exists.id)
    }
    this.keys.add({ id, groupId, publicKey, privateKey, sharedKey })
  }

  async getKey (groupId: string): Promise<GroupKey | undefined> {
    const res = await this.keys.get({ groupId })
    return res
  }
}
