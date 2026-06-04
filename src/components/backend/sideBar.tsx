'use client'

import { Layout, Menu } from 'antd'
import {
  PieChartOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BackStore } from "@/stores/backStore";



const { Sider } = Layout

interface SideBarProps {
  collapsed: boolean
}

const menuItems = [
  {
    key: 'dashboard',
    icon: <PieChartOutlined />,
    label: '数据分析',
  },
  {
    key: 'consultation',
    icon: <MessageOutlined />,
    label: '咨询记录',
  },
]

export default function SideBar({ collapsed }: SideBarProps) {
  const router = useRouter()
  const selectedKey = BackStore(state => state.selectedKey)
  const setSelectedKey = BackStore(state => state.setSelectedKey)
  const handleClick = (key: string) => {
    setSelectedKey(key)
    router.push(`/back/${key}`)
  }


  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      className="!border-r !border-r-gray-100"
      style={{ background: '#fff' }}
    >
      {/* Logo 区域 */}
      <div
        className={`flex items-center border-b border-b-gray-100 overflow-hidden ${
          collapsed ? 'justify-center' : 'justify-start px-6'
        }`}
        style={{ height: 80, gap: 12 }}
      >
        <Image
          src="/images/机器人.png"
          alt="logo"
          width={36}
          height={36}
          className="shrink-0"
        />
        {!collapsed && (
          <div style={{ lineHeight: 1.2 }}>
            <div className="text-lg font-semibold text-gray-800">
              心理健康AI助手
            </div>
            <div className="text-sm text-gray-400 mt-0.5">
              管理后台
            </div>
          </div>
        )}
      </div>

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => handleClick(key)}
        className="!border-r-0 pt-2"
        style={{ fontSize: 16 }}
      />
    </Sider>
  )
}
