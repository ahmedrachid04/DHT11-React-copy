export type UserInfo = {
  id: string
  username: string
  email: string
  is_active: boolean
  created: string
  updated: string
  is_staff: boolean
}

export type LoginResponse = {
  refresh: string
  access: string
  user: UserInfo
}
export type LoginRequest = {
  email: string
  password: string
}
