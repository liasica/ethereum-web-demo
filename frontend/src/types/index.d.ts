declare type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

declare type ApiPaginationReq = {
  current?: number // 当前页数，从1开始
  pageSize?: number // 每页数量，默认50
}

declare type ApiPaginationRes<T> = {
  pagination: {
    current: number
    pages: number
    total: number
  }
  items: T[]
}
