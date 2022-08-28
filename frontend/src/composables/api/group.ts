import { useKeyDB } from '@/composables/db'
import { useApiPost } from './request'

export interface GroupCreateReq {
  name: string
  category: string
  maxMembers: number
  intro?: string
  sharedPublic: string // 用户公钥
}

export interface GroupDetail {
  id: string
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
  groupPublicKey: string
  keyId: string // group key 存储标识
}

export type GroupDetailWithPublicKey = GroupDetail & GroupShareKey

// 创建群
export const useGroupCreate = async (req: GroupCreateReq): Promise<boolean> => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  console.info(ecdhKeys)

  // 请求建群
  const res = await useApiPost<GroupDetailWithPublicKey, GroupCreateReq>('/group', { ...req, sharedPublic: ecdhKeys.publicKey }, true)
  if (res && ecdhKeys) {
    // 生成ECDH key
    console.info(res, ecdhKeys)
    const sharedKey = window.ecdhShare(res.groupPublicKey, ecdhKeys.privateKey)
    // 存储 ecdhKeys
    console.info(sharedKey)
    useKeyDB()?.addKey(res.keyId, res.id, ecdhKeys.publicKey, ecdhKeys.privateKey, sharedKey)
    return true
  }
  return false
}

// 加入群
export const useGroupJoin = async (groupId: string): Promise<boolean> => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  const res = await useApiPost<GroupDetailWithPublicKey, GroupKeyReq>('/group/join', { groupId, sharedPublic: ecdhKeys.publicKey }, true)
  if (res && ecdhKeys) {
    // 生成ECDH key
    console.info(res, ecdhKeys)
    // 计算并存储 ecdhKeys
    const sharedKey = window.ecdhShare(res.groupPublicKey, ecdhKeys.privateKey)
    console.info(sharedKey)
    useKeyDB()?.addKey(res.keyId, res.id, ecdhKeys.publicKey, ecdhKeys.privateKey, sharedKey)
    return true
  }
  return false
}

/**
 * 计算共享ECDH Key
 * 1. 本地调用`ecdhGenerate`生成公钥`publicKey`私钥`privateKey`
 * 2. 携带本地公钥`publicKey`和群ID提交到服务端进行计算
 * 3. 使用第二步服务端返回的群组公钥`groupPublicKey`调用方法`ecdhShare`计算得出群共享密钥`sharedKey`
 * 4. 存储密钥信息
 * 5. 若提交消息时返回加密失败(code待定), 则需要重新调用此方法生成
 * @param groupId 群组ID
 * @returns 群密钥信息
 */
export const useGroupKeyShare = async (groupId: string): Promise<boolean> => {
  // 生成私钥
  const ecdhKeys = window.ecdhGenerate()
  const res = await useApiPost<GroupShareKey, GroupKeyReq>('/group/key', { groupId, sharedPublic: ecdhKeys.publicKey })
  if (res && ecdhKeys) {
    // 生成ECDH key
    console.info(res, ecdhKeys)
    // 计算并存储 ecdhKeys
    const sharedKey = window.ecdhShare(res.groupPublicKey, ecdhKeys.privateKey)
    console.info(sharedKey)
    useKeyDB()?.addKey(res.keyId, groupId, ecdhKeys.publicKey, ecdhKeys.privateKey, sharedKey)
    return true
  }
  return false
}
