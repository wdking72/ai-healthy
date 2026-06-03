'use client'

import { useState } from 'react'
import { Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { Session } from './types'

const mockSessions: Session[] = [
  { _id: '1', title: '心理AI助手-2026/5/16 00:38:36', createdAt: '2026-05-16 00:38:36' },
  { _id: '2', title: '心理AI助手-2026/5/15 22:15:10', createdAt: '2026-05-15 22:15:10' },
  { _id: '3', title: '心理AI助手-2026/5/15 20:08:22', createdAt: '2026-05-15 20:08:22' },
  { _id: '4', title: '心理AI助手-2026/5/14 18:30:45', createdAt: '2026-05-14 18:30:45' },
  { _id: '5', title: '心理AI助手-2026/5/14 15:12:08', createdAt: '2026-05-14 15:12:08' },
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
          {mockSessions.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-colors mb-1"
              style={{
                backgroundColor: activeId === item._id ? '#fff7e6' : 'transparent',
                borderLeft: activeId === item._id ? '3px solid #faad14' : '3px solid transparent',
              }}
              onClick={() => setActiveId(item._id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-gray-800 text-sm truncate">{item.title}</div>
                <div className="text-gray-400 text-xs mt-1">{item.createdAt}</div>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
