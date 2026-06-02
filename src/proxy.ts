import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 未登录 -> 访问后台则重定向到首页，否则放行
  if (!token) {
    // 只允许访问认证页面和前台首页，其他页面重定向到登录页
    if (pathname.startsWith('/auth')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 验证 token
  try {
    const { role } = await verifyToken(token)

    if (role === 'admin') {
      // admin 不允许访问前台首页和认证页面，重定向到后台
      if (pathname === '/' || pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/back/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // role === 'user'
    if (pathname.startsWith('/back')) {
      // user 不允许访问后台，重定向到首页
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch {
    // token 过期或无效 -> 清除 cookie 并重定向到首页
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('token', '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/back/:path*', '/', '/auth/:path*'],
}
