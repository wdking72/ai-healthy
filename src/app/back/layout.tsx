'use client'

import { useState } from 'react'
import { Layout } from 'antd'
import Header from '@/components/backend/header'
import SideBar from '@/components/backend/sideBar'
import { ReactNode } from 'react'

const { Content } = Layout

export default function BackLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout className="min-h-screen">
      <SideBar collapsed={collapsed} />
      <Layout>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="m-6 p-6 bg-gray-100 rounded-lg"
          style={{ minHeight: 280 }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
