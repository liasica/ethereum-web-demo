import { useApiPost } from './request'

export interface GroupCreateReq {
  name: string
  category: string
  maxMembers: number
  intro?: string
  sharedPublic: string // 用户公钥
}

export interface GroupDetail {
  address: string
  category: string
  intro: string
  membersMax: number
  name: string
  owner: boolean
  public: boolean
}

export interface GroupKeyReq {
  groupId: string
  sharedPublic: string // 用户公钥
}

// TODO: 公钥和私钥需要保存在本地数据库中，在用户进入任意群时都需要检查该群的私钥是否存在，如果不存在则需要请求替换
// TODO: 一个群一个用户存一个key, 用户切换群或者浏览器时需要检查该群的key是否存在
export interface GroupShareKey {
  groupPublicKey: string // 待存储key
  keyId: string // group key 存储标识
}

export type GroupDetailWithPublicKey = GroupDetail & GroupShareKey

export const useGroupCreate = async (req: GroupCreateReq): Promise<boolean> => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  req.sharedPublic = ecdhKeys.public

  // 请求建群
  const res = await useApiPost<GroupDetailWithPublicKey, GroupCreateReq>('/group', req, true)
  if (res && ecdhKeys) {
    ecdhKeys.id = res.keyId
    // 生成ECDH key
    console.info(res, ecdhKeys.private)
    ecdhKeys.shared = window.ecdhShare(res.groupPublicKey, ecdhKeys.private)
    // TODO: 需要存储 ecdhKeys
    console.info(ecdhKeys)
    return true
  }
  return false
}

export const useGroupJoin = async (groupId: string): Promise<boolean> => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  const res = await useApiPost<GroupDetailWithPublicKey, GroupKeyReq>('/group/join', { groupId, sharedPublic: ecdhKeys.public }, true)
  if (res && ecdhKeys) {
    // 生成ECDH key
    console.info(res, ecdhKeys.private)
    ecdhKeys.shared = window.ecdhShare(res.groupPublicKey, ecdhKeys.private)
    ecdhKeys.id = res.keyId
    // TODO: 需要存储 ecdhKeys
    console.info(ecdhKeys)
    return true
  }
  return false
}

export const useGroupKeyShare = async (groupId: string): Promise<boolean> => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  const res = await useApiPost<GroupShareKey, GroupKeyReq>('/group/key', { groupId, sharedPublic: ecdhKeys.public })
  if (res && ecdhKeys) {
    // TODO: 需要存储 ecdhKeys
    console.info(res)
    ecdhKeys.id = res.keyId
    // 计算Key
    ecdhKeys.shared = window.ecdhShare(res.groupPublicKey, ecdhKeys.private)
    console.info(ecdhKeys)
    return true
  }
  return false
}
