'use client'
import Image from "next/image";
import { Button } from "antd";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  // 处理登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogout = () => {
    setIsLoggedIn(!isLoggedIn);
  }

  return (
    <>
      <div className="h-[70px] flex items-center justify-between px-40" >
        <div className="flex items-center gap-2">
          <Image src="/images/机器人.png" alt="心理健康AI助手" width={50} height={50} /> 
          <span className="text-2xl font-semibold">心理健康AI助手</span>
        </div>
        <div>
          <nav>
          <Button className="mx-2 text-lg" type="text">首页</Button>
          {isLoggedIn ? 
          <>
            <Button className="mx-2 text-lg" type="text">AI咨询</Button>
            <Button className="mx-2 text-lg" type="text">情绪日记</Button>
          </>
          : null}
          <Button className="mx-2 text-lg" type="text">知识库</Button>
          {isLoggedIn ? 
          <>
            <Button className="mx-2 text-lg" onClick={handleLogout}>退出登录</Button>
          </>
          : 
          <>
            <Button className="mx-2 text-lg" onClick={handleLogout}><Link href="/auth/login">登录</Link></Button>
            <Button className="mx-2 text-lg" type="primary"><Link href="/auth/rigester">注册</Link></Button>
          </>
          }
          
          </nav>
        </div>
      </div>
    </>
  );
}
