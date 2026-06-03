// user_info cookie 的通用配置（非 HTTP-only，前端可读）

export interface UserInfo {
  userId: string
  username: string
  role: string
}

export interface CookieSetter {
  set: (name: string, value: string, options: Record<string, unknown>) => void
}
// user_info cookie 的通用配置（非 HTTP-only，前端可读）
const USER_INFO_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
}

// 清除 user_info cookie 的配置（非 HTTP-only，前端可读）
const CLEAR_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 0,
  path: '/',
}

export function setUserInfoCookie(cookies: CookieSetter, userInfo: UserInfo) {
  cookies.set('user_info', JSON.stringify(userInfo), USER_INFO_OPTIONS)
}

export function clearUserInfoCookie(cookies: CookieSetter) {
  cookies.set('user_info', '', CLEAR_OPTIONS)
}
