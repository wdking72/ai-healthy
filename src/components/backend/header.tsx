'use client'

import { Layout, Button, Avatar, Space } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout

interface HeaderProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  title?: string
}

export default function Header({ collapsed, setCollapsed, title = '数据分析' }: HeaderProps) {
  return (
    <AntHeader className="!bg-white !px-8 flex items-center justify-between !border-b !border-b-gray-100"
      style={{ height: 80, lineHeight: '80px' }}
    >
      <Space>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="!text-lg !w-16 !h-16"
        />
        <span className="text-xl font-semibold text-gray-800">
          {title}
        </span>
      </Space>

      <Space>
        <Avatar icon={<UserOutlined />} />
        <span className="text-gray-500 text-base">admin</span>
      </Space>
    </AntHeader>
  )
}
