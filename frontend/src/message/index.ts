export enum Operate {
  Register = 1,
  Chat = 2,
}

export class Message<T> {
  operate: Operate

  data: T

  constructor (operate: Operate, data: T) {
    this.operate = operate
    this.data = data
  }

  toArrayBuffer (): ArrayBuffer {
    const str = JSON.stringify(this)
    const encoder = new TextEncoder()
    return encoder.encode(str)
  }

  static async fromBlob<T> (blob: Blob): Promise<Message<T>> {
    const buffer = await blob.arrayBuffer()
    const decoder = new TextDecoder()
    const str = decoder.decode(buffer)
    return JSON.parse(str)
  }
}
