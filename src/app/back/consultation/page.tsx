'use client'

import { useState, useEffect } from 'react'
import { LoadingOutlined, UserOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Tag } from 'antd'

// ---------- 类型 ----------

interface User {
  _id: string
  username: string
  email?: string
  nickname?: string
  createdAt?: string
}

interface EmotionTag {
  tag: string
  time: string
}

interface Session {
  _id: string
  title: string
  summary?: string
  createdAt: string
  updatedAt: string
  emotionTags?: EmotionTag[]
  messageCount?: number
}

interface SessionOverview {
  session: {
    _id: string
    title: string
    summary?: string
    userId?: string
    createdAt: string
    updatedAt: string
  }
  emotionTags: {
    role: string
    tag: string
    content: string
    time: string
  }[]
  messageCount: number
}

// ---------- 情绪标签颜色映射 ----------

const emotionColors: Record<string, string> = {
  happy: 'green',
  sad: 'blue',
  anxious: 'orange',
  angry: 'red',
  calm: 'purple',
  fearful: 'volcano',
  surprised: 'geekblue',
  neutral: 'default',
}

// ---------- 主组件 ----------

export default function Consultation() {
  // 用户列表
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)

  // 选中的用户
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // 会话列表
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // 选中的会话
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // 会话概览
  const [overview, setOverview] = useState<SessionOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)

  // 加载用户列表
  useEffect(() => {
    let ignore = false
    setUsersLoading(true)
    ;(async () => {
      try {
        const res = await fetch('/api/back/consult/users')
        if (!res.ok) return
        const data = await res.json()
        if (!ignore) setUsers(data.users || [])
      } catch (err) {
        console.error('获取用户列表失败:', err)
      } finally {
        if (!ignore) setUsersLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [])

  // 选中用户时加载会话列表
  useEffect(() => {
    if (!selectedUserId) {
      setSessions([])
      setOverview(null)
      setSelectedSessionId(null)
      return
    }
    let ignore = false
    setSessionsLoading(true)
    setOverview(null)
    setSelectedSessionId(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/back/consult/sessions?userId=${selectedUserId}`)
        if (!res.ok) return
        const data = await res.json()
        if (!ignore) setSessions(data.sessions || [])
      } catch (err) {
        console.error('获取会话列表失败:', err)
      } finally {
        if (!ignore) setSessionsLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [selectedUserId])

  // 选中会话时加载概览
  useEffect(() => {
    if (!selectedSessionId) {
      setOverview(null)
      return
    }
    let ignore = false
    setOverviewLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/back/consult/sessions/${selectedSessionId}/overview`)
        if (!res.ok) return
        const data = await res.json()
        if (!ignore) setOverview(data)
      } catch (err) {
        console.error('获取会话概览失败:', err)
      } finally {
        if (!ignore) setOverviewLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [selectedSessionId])

  const formatTime = (t?: string) => {
    if (!t) return ''
    return new Date(t).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex h-[calc(100vh-180px)] gap-4">
      {/* ====== 左栏：用户列表 ====== */}
      <div className="w-[260px] flex-shrink-0 bg-white rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="px-4 py-3 text-gray-800 font-medium text-base border-b border-gray-100">
          用户列表
        </div>
        <div className="flex-1 overflow-y-auto">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingOutlined className="text-amber-400 text-xl" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-12">暂无用户</div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50"
                style={{
                  backgroundColor: selectedUserId === user._id ? '#fff7e6' : 'transparent',
                  borderLeft: selectedUserId === user._id ? '3px solid #faad14' : '3px solid transparent',
                }}
                onClick={() => {
                  setSelectedUserId(user._id)
                  setSelectedSessionId(null)
                }}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <UserOutlined className="text-amber-500 text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-gray-800 text-sm truncate font-medium">
                    {user.nickname || user.username}
                  </div>
                  <div className="text-gray-400 text-xs truncate">{user.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ====== 中栏：会话列表 ====== */}
      <div className="w-[300px] flex-shrink-0 bg-white rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="px-4 py-3 text-gray-800 font-medium text-base border-b border-gray-100">
          会话列表
          {selectedUserId && <span className="text-gray-400 text-sm font-normal ml-2">({sessions.length})</span>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {!selectedUserId ? (
            <div className="text-gray-400 text-sm text-center py-12">请先在左侧选择一个用户</div>
          ) : sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingOutlined className="text-amber-400 text-xl" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-12">该用户暂无会话记录</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className="px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50"
                style={{
                  backgroundColor: selectedSessionId === session._id ? '#fff7e6' : 'transparent',
                  borderLeft: selectedSessionId === session._id ? '3px solid #faad14' : '3px solid transparent',
                }}
                onClick={() => setSelectedSessionId(session._id)}
              >
                <div className="text-gray-800 text-sm truncate font-medium mb-1">
                  <MessageOutlined className="mr-1.5 text-amber-400 text-xs" />
                  {session.title}
                </div>
                {session.summary && (
                  <div className="text-gray-500 text-xs line-clamp-2 mb-1.5">
                    {session.summary}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">
                    <ClockCircleOutlined className="mr-1" />
                    {formatTime(session.createdAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    {session.emotionTags && session.emotionTags.length > 0 && (
                      <Tag
                        color={emotionColors[session.emotionTags[session.emotionTags.length - 1]?.tag] || 'default'}
                        className="!text-xs !px-1.5 !py-0 !m-0"
                      >
                        {session.emotionTags[session.emotionTags.length - 1]?.tag}
                      </Tag>
                    )}
                    {session.messageCount !== undefined && (
                      <span className="text-gray-400 text-xs">{session.messageCount}条</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ====== 右栏：会话概览 ====== */}
      <div className="flex-1 bg-white rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="px-4 py-3 text-gray-800 font-medium text-base border-b border-gray-100">
          会话概览
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedSessionId ? (
            <div className="text-gray-400 text-sm text-center py-12">
              {selectedUserId ? '请选择一个会话查看详情' : '请先在左侧选择一个用户'}
            </div>
          ) : overviewLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingOutlined className="text-amber-400 text-xl" />
            </div>
          ) : overview ? (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-gray-800 font-medium text-base mb-3">{overview.session.title}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
                  <div>
                    <ClockCircleOutlined className="mr-1.5 text-amber-400" />
                    创建时间：{new Date(overview.session.createdAt).toLocaleString('zh-CN')}
                  </div>
                  <div>
                    <MessageOutlined className="mr-1.5 text-amber-400" />
                    消息数量：{overview.messageCount} 条
                  </div>
                </div>
              </div>

              {/* 对话概要 */}
              <div>
                <h4 className="text-gray-700 font-medium text-sm mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-amber-400 rounded inline-block" />
                  对话概要
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
                  {overview.session.summary || '暂无概要'}
                </div>
              </div>

              {/* 情绪标签 */}
              <div>
                <h4 className="text-gray-700 font-medium text-sm mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-amber-400 rounded inline-block" />
                  情绪标签
                </h4>
                {overview.emotionTags.length === 0 ? (
                  <div className="text-gray-400 text-sm">暂无情绪标签</div>
                ) : (
                  <div className="space-y-2">
                    {overview.emotionTags.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <Tag
                          color={emotionColors[item.tag] || 'default'}
                          className="!text-xs !px-2 !py-0.5 !m-0 flex-shrink-0 mt-0.5"
                        >
                          {item.tag}
                        </Tag>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 mb-0.5">
                            {item.role === 'user' ? '用户' : 'AI'} · {formatTime(item.time)}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {item.content || '（内容过长已截断）'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm text-center py-12">加载失败</div>
          )}
        </div>
      </div>
    </div>
  )
}
