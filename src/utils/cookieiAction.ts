'use server'
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

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

export const clearTokenCookie = async () => {
  const cookieStore = await cookies()
  cookieStore.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  cookieStore.set('user_info', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return { success: true, message: '已退出登录' }
}