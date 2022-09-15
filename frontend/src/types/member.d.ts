declare type NonceRes = {
  nonce: string
}

declare type SigninReq = {
  address: string
  signature: string
  nonce: string
}

declare type Profile = {
  id: string
  address: string
  nickname?: string
  avatar?: string
  intro?: string
}

declare type SigninRes = {
  token: string
  profile: Profile
}
