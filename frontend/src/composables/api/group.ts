import { useKeyDB } from '@/composables/db'
import { useApiPost } from './request'

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
    await useKeyDB()?.addKey(res.keyId, res.id, ecdhKeys.publicKey, ecdhKeys.privateKey, sharedKey)
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
    await useKeyDB()?.addKey(res.keyId, res.id, ecdhKeys.publicKey, ecdhKeys.privateKey, sharedKey)
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
    await useKeyDB()?.addKey(res.keyId, groupId, ecdhKeys.publicKey, ecdhKeys.privateKey, sharedKey)
    return true
  }
  return false
}
