'use client'

import { SendOutlined, MessageOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { useState, useRef, useEffect } from 'react'
import SessionHeader from './sessionHeader'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function Message() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || loading) return

    setInputValue('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    // 添加一个空的 AI 消息占位，后续流式填充
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/consult/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''
      let newSessionId = sessionId

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              newSessionId = data.sessionId
              if (!sessionId) setSessionId(data.sessionId)
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

      if (newSessionId && !sessionId) {
        setSessionId(newSessionId)
      }
    } catch (err) {
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
      setLoading(false)
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
      <SessionHeader />

      {/* 消息内容区域 */}
      <div className="flex-1 mx-4 bg-gray-50 overflow-hidden flex items-center justify-center">
        {messages.length === 0 ? (
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
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 text-sm shadow-sm border ${
                    msg.role === 'user'
                      ? 'bg-white rounded-2xl rounded-br-md text-gray-800 border-gray-200'
                      : 'bg-amber-50 rounded-2xl rounded-bl-md text-gray-800 border-amber-100'
                  }`}
                >
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="text-gray-400">
                      <LoadingOutlined className="mr-1" />思考中...
                    </span>
                  ) : msg.content)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
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
