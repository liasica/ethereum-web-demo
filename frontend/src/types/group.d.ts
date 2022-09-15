declare type GroupCreateReq = {
  name: string
  category: string
  maxMembers: number
  intro?: string
  sharedPublic: string // 用户公钥
}

declare type GroupDetail = {
  id: string
  address: string
  category: string
  intro: string
  membersMax: number
  name: string
  owner: boolean
  public: boolean
}

declare type GroupKeyReq = {
  groupId: string
  sharedPublic: string // 用户公钥
}

// TODO: 公钥和私钥需要保存在本地数据库中，在用户进入任意群时都需要检查该群的私钥是否存在，如果不存在则需要请求替换
// TODO: 一个群一个用户存一个key, 用户切换群或者浏览器时需要检查该群的key是否存在
declare type GroupShareKey = {
  groupPublicKey: string
  keyId: string // group key 存储标识
}

declare type GroupDetailWithPublicKey = GroupDetail & GroupShareKey

declare type GroupKeyUsed = {
  groupId: string
  keyId: string
}

declare type GroupKeyUsedReq = {
  keys: GroupKeyUsed[]
}
