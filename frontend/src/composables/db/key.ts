import Dexie, { Table } from 'dexie'

export interface GroupKey {
  id: string
  groupId: string
  memberId: string
  public: string
  private: string
  shared: string
}

export class GroupKeyDexie extends Dexie {
  keys!: Table<GroupKey>

  constructor (address: string) {
    super(address)
    this.version(1).stores({
      keys: 'id, groupId, memberId',
    })
  }
}
