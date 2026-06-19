'use client'

import { SendOutlined, MessageOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { useState, useRef, useEffect } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import SessionHeader from './sessionHeader'
import ModelSettingsModal from './modelSettingsModal'
import type { ModelSettings } from './modelSettingsModal'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function Message({
  sessionId,
  onSessionChange,
  onLoadingChange,
  abortRef,
}: {
  sessionId: string | null
  onSessionChange: (id: string | null) => void
  onLoadingChange: (loading: boolean) => void
  abortRef: React.MutableRefObject<AbortController | null>
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const scrollerRef = useRef<HTMLElement | Window | null>(null)
  const lastScrollHeightRef = useRef(0)

  // AI 回复期间：内容增长时滚动到底部（不闪烁）
  useEffect(() => {
    if (!loading) return
    lastScrollHeightRef.current = 0
    const timer = setInterval(() => {
      const el = scrollerRef.current
      if (el && !(el instanceof Window)) {
        if (el.scrollHeight !== lastScrollHeightRef.current) {
          lastScrollHeightRef.current = el.scrollHeight
          el.scrollTop = el.scrollHeight
        }
      }
    }, 80)
    return () => clearInterval(timer)
  }, [loading])

  // 切换会话时加载历史消息
  useEffect(() => {
    if (!sessionId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionLoading(true)
    let ignore = false

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/consult/sessions/${sessionId}/messages`)
        if (!res.ok) return
        const data = await res.json()
        if (!ignore) {
          setMessages((data.messages || []).map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })))
        }
      } catch (err) {
        console.error('获取消息失败:', err)
      } finally {
        if (!ignore) setSessionLoading(false)
      }
    }
    fetchMessages()

    return () => { ignore = true }
  }, [sessionId])

  const getModelSettings = (): ModelSettings | null => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('modelSettings')
    return saved ? JSON.parse(saved) : null
  }

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || loading) return

    setInputValue('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    onLoadingChange(true)

    // 发送后立即滚到底部（用户可能翻阅过历史）
    // useEffect([messages, loading]) 会自动处理滚动

    // 创建 AbortController，旧的请求会被取消
    const controller = new AbortController()
    abortRef.current = controller

    // 添加一个空的 AI 消息占位，后续流式填充
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const modelSettings = getModelSettings()
      const body: Record<string, unknown> = {
        sessionId,
        message: text,
      }
      if (modelSettings && modelSettings.source !== 'siliconflow') {
        body.modelSource = modelSettings.source
        if (modelSettings.modelName) body.modelName = modelSettings.modelName
        if (modelSettings.apiKey) body.apiKey = modelSettings.apiKey
        if (modelSettings.baseURL) body.baseURL = modelSettings.baseURL
      }

      const res = await fetch('/api/consult/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              if (!sessionId) {
                onSessionChange(data.sessionId)
              }
            } else if (data.content) {
              fullContent += data.content
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: fullContent }
                }
                return updated
              })
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return
      console.error('Chat error:', err)
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: '抱歉，回复出错了，请稍后重试。' }
        }
        return updated
      })
    } finally {
      abortRef.current = null
      setLoading(false)
      onLoadingChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <SessionHeader
        onNewSession={() => {
          abortRef.current?.abort()
          abortRef.current = null
          setMessages([])
          setLoading(false)
          onLoadingChange(false)
          onSessionChange(null)
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ModelSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={() => {}}
      />

      {/* 消息内容区域 */}
      <div className={`flex-1 mx-4 bg-gray-50 overflow-hidden flex ${sessionLoading || messages.length === 0 ? 'items-center justify-center' : 'flex-col'}`}>
        {sessionLoading ? (
          <div className="flex flex-col items-center gap-4 text-gray-400 select-none">
            <LoadingOutlined className="text-3xl text-amber-400" />
            <div className="text-gray-500 text-sm">加载中...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-gray-400 select-none">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
              <MessageOutlined className="text-3xl text-amber-400" />
            </div>
            <div className="text-center">
              <div className="text-gray-600 text-base font-medium mb-1">开始一段新的对话</div>
              <div className="text-gray-400 text-sm">在下方输入您的心理困扰，AI 心理助手将为您提供帮助</div>
            </div>
          </div>
        ) : (
          <Virtuoso
            key={sessionId}
            ref={virtuosoRef}
            scrollerRef={(ref) => { scrollerRef.current = ref }}
            className="flex-1"
            data={messages}
            initialTopMostItemIndex={Math.max(0, messages.length - 1)}
            increaseViewportBy={200}
            components={{ Footer: () => <div className="h-4" /> }}
            itemContent={(index, msg) => (
              <div
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} px-4 ${index === 0 ? 'pt-4' : ''} ${index < messages.length - 1 ? 'mb-4' : ''}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 text-sm shadow-sm border ${
                    msg.role === 'user'
                      ? 'bg-white rounded-2xl rounded-br-md text-gray-800 border-gray-200'
                      : 'bg-amber-50 rounded-2xl rounded-bl-md text-gray-800 border-amber-100'
                  }`}
                >
                  {msg.content || (loading && index === messages.length - 1 ? (
                    <span className="text-gray-400">
                      <LoadingOutlined className="mr-1" />思考中...
                    </span>
                  ) : msg.content)}
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* 底部输入区 */}
      <div className="flex items-end gap-2 px-3 py-3 mx-4 bg-gray-50 rounded-bl-2xl rounded-br-2xl mb-4">
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请描述您的心理困扰..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          variant="borderless"
          disabled={loading}
          className="!bg-white !rounded-lg !px-3 !py-1.5 !text-sm !border !border-gray-300 !shadow-sm"
        />
        <Button
          type="primary"
          shape="circle"
          className="!w-8 !h-8 !flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)' }}
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
        />
      </div>
    </div>
  )
}
