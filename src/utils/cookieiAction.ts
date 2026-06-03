'use server'
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import type { CookieSetter } from "@/lib/cookieOptions";
import { clearUserInfoCookie } from "@/lib/cookieOptions";

export const verifyTokenFromCookie = async ( ) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  if (!token) {
    return { success: false, message: '未登录' }
  }
  try {
    const payload = await verifyToken(token.value)
    return { success: true, userInfo: payload }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'token验证失败'
    return { success: false, message: errMsg }
  }
} 
// 清除 token cookie 和 user_info cookie
export const clearTokenCookie = async () => {
  const cookieStore = await cookies()
  cookieStore.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  clearUserInfoCookie(cookieStore as CookieSetter)
  return { success: true, message: '已退出登录' }
} 