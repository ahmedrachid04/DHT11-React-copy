export type UserInfo = {
  id: string
  username: string
  email: string
  is_active: boolean
  created: string
  updated: string
  is_staff: boolean
}
//same userInfo but all the fields are optional , use generics
export type UpdateUserInfo = {
  username?: string
  email?: string
  is_active?: boolean
  is_staff?: boolean
}

export type AddUserInfo = {
  username: string
  email: string
  password: string
  is_staff?: boolean
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
