'use client'

import { useState } from 'react'
import { Modal, Select, Input } from 'antd'

export interface ModelSettings {
  source: 'siliconflow' | 'deepseek' | 'custom'
  apiKey: string
  baseURL: string
  modelName: string
}

const defaultSettings: ModelSettings = {
  source: 'siliconflow',
  apiKey: '',
  baseURL: '',
  modelName: '',
}

const MODEL_OPTIONS: Record<string, { label: string; models: string[] }> = {
  siliconflow: {
    label: '硅基流动 (SiliconFlow)',
    models: ['Qwen/Qwen3-8B', 'deepseek-ai/DeepSeek-V3.2', 'deepseek-ai/DeepSeek-R1'],
  },
  deepseek: {
    label: 'DeepSeek 官方',
    models: ['deepseek-chat'],
  },
  custom: {
    label: '自定义 API',
    models: [],
  },
}

export default function ModelSettingsModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (settings: ModelSettings) => void
}) {
  const [settings, setSettings] = useState<ModelSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings
    const saved = localStorage.getItem('modelSettings')
    return saved ? JSON.parse(saved) : defaultSettings
  })

  const currentSource = MODEL_OPTIONS[settings.source]

  const handleSave = () => {
    localStorage.setItem('modelSettings', JSON.stringify(settings))
    onSave(settings)
    onClose()
  }

  return (
    <Modal
      title="模型设置"
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
    >
      <div className="flex flex-col gap-4 py-2">
        {/* 模型来源 */}
        <div>
          <div className="text-sm text-gray-600 mb-1.5">模型来源</div>
          <Select
            value={settings.source}
            onChange={(value) =>
              setSettings({
                ...defaultSettings,
                source: value,
                apiKey: settings.apiKey,
                baseURL: settings.baseURL,
              })
            }
            className="!w-full"
            options={[
              { value: 'siliconflow', label: '硅基流动 (SiliconFlow)' },
              { value: 'deepseek', label: 'DeepSeek 官方' },
              { value: 'custom', label: '自定义 API' },
            ]}
          />
        </div>

        {/* 模型选择 */}
        {currentSource.models.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-1.5">模型</div>
            <Select
              value={settings.modelName || currentSource.models[0]}
              onChange={(value) => setSettings({ ...settings, modelName: value })}
              className="!w-full"
              options={currentSource.models.map((m) => ({ value: m, label: m }))}
            />
          </div>
        )}

        {/* API Key */}
        <div>
          <div className="text-sm text-gray-600 mb-1.5">API Key {settings.source !== 'custom' && <span className="text-gray-400">（留空使用环境变量中的默认 Key）</span>}</div>
          <Input.Password
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            placeholder={settings.source === 'siliconflow' ? '留空则使用 SILICONFLOW_API_KEY' : '留空则使用 DEEPSEEK_API_KEY'}
          />
        </div>

        {/* 自定义 API 地址 */}
        {settings.source === 'custom' && (
          <div>
            <div className="text-sm text-gray-600 mb-1.5">API 地址</div>
            <Input
              value={settings.baseURL}
              onChange={(e) => setSettings({ ...settings, baseURL: e.target.value })}
              placeholder="https://api.example.com/v1"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
