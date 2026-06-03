import { HeartOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

export default function SessionHeader({ onNewSession }: { onNewSession?: () => void }) {
  return (
    <div
      className="h-[90px] rounded-tr-2xl rounded-tl-2xl flex items-center justify-between px-6 mx-4 mt-4"
      style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
          <HeartOutlined className="text-white text-base" />
        </div>
        <div>
          <div className="text-white font-medium text-base">心理AI助手</div>
          <div className="text-white/80 text-xs">您的心理助手，为您提供专业的心理咨询和建议。</div>
        </div>
      </div>
      <Tooltip title="新增会话" color="white" placement="bottom">
        <div className="w-8 h-8 flex items-center justify-center">
          <Button
            type="text"
            shape="circle"
            className="!w-8 !h-8 !bg-white/30 !text-white hover:!bg-white/50"
            icon={<PlusOutlined />}
            onClick={onNewSession}
          />
        </div>
      </Tooltip>
    </div>
  )
}
