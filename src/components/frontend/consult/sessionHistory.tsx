'use client'

import { useState, useEffect } from 'react'
import { Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { Session } from './types'

export default function SessionHistory({
  activeId,
  onSelect,
  refreshKey,
}: {
  activeId: string | null
  onSelect: (id: string) => void
  refreshKey?: number
}) {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await fetch('/api/consult/sessions')
        if (!res.ok) return
        const data = await res.json()
        if (!ignore) setSessions(data.sessions || [])
      } catch (err) {
        console.error('获取会话列表失败:', err)
      }
    })()
    return () => { ignore = true }
  }, [refreshKey])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/consult/sessions/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setSessions((prev) => prev.filter((s) => s._id !== id))
      if (activeId === id) {
        onSelect('')
      }
    } catch (err) {
      console.error('删除会话失败:', err)
    }
  }

  return (
    <div className="w-[300px] flex flex-col bg-white border-r border-gray-100">
      {/* 会话列表 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-5 pb-3 text-gray-800 font-medium text-base">
          会话列表
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {sessions.length === 0 ? (
            <div className="text-gray-400 text-sm text-center pt-8">暂无会话记录</div>
          ) : (
            sessions.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-colors mb-1"
                style={{
                  backgroundColor: activeId === item._id ? '#fff7e6' : 'transparent',
                  borderLeft: activeId === item._id ? '3px solid #faad14' : '3px solid transparent',
                }}
                onClick={() => onSelect(item._id)}
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
                  onClick={(e) => handleDelete(item._id, e)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
