'use client'
import Image from "next/image";
import { Button } from "antd";
import { useState } from "react";
import Link from "next/link";
import { clearTokenCookie } from "@/utils/cookieiAction";

function getUserInfoFromCookie() {
  if (typeof document === 'undefined') return null
  // 从 cookie 中读取 user_info
  // 注意：这里假设 user_info 是 JSON 字符串，实际应用中需要根据实际情况解析
  const match = document.cookie.match(/(?:^|;\s*)user_info=([^;]*)/)
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getUserInfoFromCookie());

  const handleLogout = async () => {
    await clearTokenCookie()
    setIsLoggedIn(false)
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
