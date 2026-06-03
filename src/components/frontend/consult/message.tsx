'use client'

import { SendOutlined, MessageOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { useState } from 'react'
import SessionHeader from './sessionHeader'

export default function Message() {
  const [messages, setMessages] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return
    setMessages([...messages, inputValue])
    console.log('发送消息:', inputValue)
    setInputValue('')
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
              <div key={i} className="mb-4 flex justify-end">
                <div className="max-w-[70%] bg-white rounded-2xl rounded-br-md px-4 py-3 text-sm text-gray-800 shadow-sm border border-gray-200">
                  {msg}
                </div>
              </div>
            ))}
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
          className="!bg-white !rounded-lg !px-3 !py-1.5 !text-sm !border !border-gray-300 !shadow-sm"
        />
        <Button
          type="primary"
          shape="circle"
          className="!w-8 !h-8 !flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)' }}
          icon={<SendOutlined />}
          onClick={handleSend}
        />
      </div>
    </div>
  )
}
