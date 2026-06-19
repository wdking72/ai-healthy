import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { setUserInfoCookie, clearUserInfoCookie } from '@/lib/cookieOptions'
import type { CookieSetter } from '@/lib/cookieOptions'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 未登录 -> 只允许访问首页，其他页面重定向到登录页
  if (!token) {
    if (pathname === '/' || pathname.startsWith('/auth')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 验证 token
  try {
    const payload = await verifyToken(token)
    const { role, userId, username } = payload

    // admin 只允许访问 /back/*，其他全部重定向到后台
    if (role === 'admin' && !pathname.startsWith('/back')) {
      return NextResponse.redirect(new URL('/back/dashboard', request.url))
    }

    // user 不允许访问后台
    if (role === 'user' && pathname.startsWith('/back')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 放行并通过非 HttpOnly cookie 把 userInfo 传给客户端
    const response = NextResponse.next()
    setUserInfoCookie(response.cookies as CookieSetter, { userId, username, role })
    return response
  } catch {
    // token 过期或无效 -> 清除 cookie 并重定向到登录页
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.set('token', '', { maxAge: 0, path: '/' })
    clearUserInfoCookie(response.cookies as CookieSetter)
    return response
  }
}

export const config = {
  matcher: ['/back/:path*', '/auth/:path*', '/front/:path*'],
}
