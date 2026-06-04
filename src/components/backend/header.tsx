'use client'

import { Layout, Button, Avatar, Space, Dropdown } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { clearTokenCookie } from '@/utils/cookieiAction'
import { BackStore } from "@/stores/backStore";



const { Header: AntHeader } = Layout

interface HeaderProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  title?: string
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const selectedKey = BackStore(state => state.selectedKey)
  const handleLogout = async () => {
    await clearTokenCookie()
    window.location.href = '/auth/login'
  }


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
          {selectedKey === 'dashboard' ? '数据分析' : '咨询记录'}
        </span>
      </Space>

      <Space>
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '退出登录',
                onClick: handleLogout,
              },
            ],
          }}
          placement="bottomRight"
        >
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="text-gray-500 text-base ml-2">admin</span>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}
