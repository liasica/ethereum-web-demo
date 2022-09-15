declare type NonceRes = {
  nonce: string
}

declare type SigninReq = {
  address: string
  signature: string
  nonce: string
}

declare type SigninRes = {
  token: string
}
