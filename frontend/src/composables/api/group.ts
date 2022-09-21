import { useKeyDB } from '@/composables/db'
import { useApiGet, useApiPost } from './request'

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

/**
 * 设置当前使用的群组keys
 * :::注意:::
 * 0.接口应该在socket连接成功后<立即>请求
 * 1.获取所有用户已加入的groups
 * 2.获取本地的group keys (若本地未保存keys则需要请求useGroupKeyShare创建keys)
 * 3.将所有的key提交到服务器 (useGroupKeyUsed)
 * @param data 当前使用的群组keys
 * @returns void
 */
export const useGroupKeyUsed = async (data: GroupKeyUsedReq) => useApiPost('/group/key/used', data)

/**
 * 获取所有已加入群组
 * @returns 已加入的全部群组详情
 */
export const useJoinedGroupList = async () => useApiGet<GroupDetail[]>('/group/joined')

/**
 * 分页筛选群组
 * @param req 分页和筛选数据
 * @returns 群组分页列表
 */
export const useGroupList = async (req?: GroupListReq): Promise<ApiPaginationRes<GroupListRes> | undefined> => {
  let query = ''
  if (req) {
    const searchParams = new URLSearchParams()
    const keys = Object.keys(req) as (keyof typeof req)[]
    keys.forEach(key => searchParams.append(key, `${req[key]}`))
    query = `?${searchParams.toString()}`
  }
  return useApiGet<ApiPaginationRes<GroupListRes>>(`/group${query}`)
}

/**
 * 获取已加入的群组详情
 * @param id 群组ID
 * @returns 群组详情
 */
export const useGroupDetail = async (id: string): Promise<GroupDetail | undefined> => useApiGet<GroupDetail>(`/group/${id}`)
