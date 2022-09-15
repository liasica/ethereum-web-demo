import { useApiPost } from './request'

/**
 * 创建消息
 * @param req 消息信息(content需要使用shared key进行aes加密)
 * @returns 消息id和创建时间
 */
export const useMessageCreate = async (req: ChatMessage): Promise<ChatMessageCreatRes | undefined> => useApiPost<ChatMessageCreatRes, ChatMessage>('/message', req)
