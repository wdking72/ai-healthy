export interface UserType {
  username: string
  email: string
  password: string
  nickname?: string
  phone?: string
}

export interface LoginUser {
  username: string
  password: string
}