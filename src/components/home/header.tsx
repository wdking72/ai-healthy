'use client'
import Image from "next/image";
import { Button } from "antd";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { clearTokenCookie } from "@/utils/cookieiAction";

function getUserInfoFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)user_info=([^;]*)/)
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

function useIsLoggedIn() {
  return useSyncExternalStore(
    // cookies 只在页面导航/刷新时变化，无需订阅
    () => () => {},
    // 客户端读取 cookie
    () => !!getUserInfoFromCookie(),
    // SSR 时永远返回 false
    () => false,
  )
}

export default function Header() {
  const isLoggedIn = useIsLoggedIn()

  const handleLogout = async () => {
    await clearTokenCookie()
    window.location.href = '/'
  }

  return (
    <div className="h-[70px] flex items-center justify-between px-40">
      <div className="flex items-center gap-2">
        <Image src="/images/机器人.png" alt="心理健康AI助手" width={50} height={50} />
        <span className="text-2xl font-semibold">心理健康AI助手</span>
      </div>
      <nav>
        <Button className="mx-2 text-lg" type="text">
          <Link href="/">首页</Link>
        </Button>
        {isLoggedIn && (
          <>
            <Button className="mx-2 text-lg" type="text">AI咨询</Button>
            <Button className="mx-2 text-lg" type="text">情绪日记</Button>
          </>
        )}

        {isLoggedIn ? (
          <Button className="mx-2 text-lg" onClick={handleLogout}>退出登录</Button>
        ) : (
          <>
            <Button className="mx-2 text-lg"><Link href="/auth/login">登录</Link></Button>
            <Button className="mx-2 text-lg" type="primary"><Link href="/auth/rigester">注册</Link></Button>
          </>
        )}
      </nav>
    </div>
  );
}
