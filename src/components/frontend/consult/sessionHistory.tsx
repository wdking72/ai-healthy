'use client'

import { useState } from 'react'
import { List, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { Session } from './types'

const mockSessions: Session[] = [
  { id: '1', title: '心理AI助手-2026/5/16 00:38:36', time: '2026-05-16 00:38:36' },
  { id: '2', title: '心理AI助手-2026/5/15 22:15:10', time: '2026-05-15 22:15:10' },
  { id: '3', title: '心理AI助手-2026/5/15 20:08:22', time: '2026-05-15 20:08:22' },
  { id: '4', title: '心理AI助手-2026/5/14 18:30:45', time: '2026-05-14 18:30:45' },
  { id: '5', title: '心理AI助手-2026/5/14 15:12:08', time: '2026-05-14 15:12:08' },
]

export default function SessionHistory() {
  const [activeId, setActiveId] = useState('1')

  return (
    <div className="w-[300px] flex flex-col bg-white border-r border-gray-100">
      {/* 会话列表 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-5 pb-3 text-gray-800 font-medium text-base">
          会话列表
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <List
            dataSource={mockSessions}
            renderItem={(item) => (
              <List.Item
                className="!px-3 !py-3 rounded-lg cursor-pointer transition-colors mb-1"
                style={{
                  backgroundColor: activeId === item.id ? '#fff7e6' : 'transparent',
                  borderLeft: activeId === item.id ? '3px solid #faad14' : '3px solid transparent',
                }}
                onClick={() => setActiveId(item.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800 text-sm truncate">{item.title}</div>
                  <div className="text-gray-400 text-xs mt-1">{item.time}</div>
                </div>
                <Button
                  type="text"
                  size="small"
                  className="!text-gray-400 hover:!text-red-500"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  )
}
