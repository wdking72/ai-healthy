'use client'
import Image from "next/image";

export default function SideImage() {
  return (
    <div className="w-1/2 min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(74, 156, 140) 0%, rgb(61, 138, 122) 100%)' }}>
      {/* 标题 */}
      <h1 className="text-4xl font-bold text-white mb-6">心理AI助手</h1>
      
      {/* 描述文案 */}
      <p className="text-white text-center max-w-md mb-12 text-lg leading-relaxed px-8">
        每个深夜，每个焦虑的时候，我们都在这里。不必独自承受，让心与心的链接温暖你的每一天
      </p>
      
      {/* 机器人图标 */}
      <div 
        className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center shadow-md " 
        style=
        {{
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.2)', 
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
        }}
        
      >
          <Image
            src="/images/robot-fill.png"
            alt="AI助手"
            width={100}
            height={100}
            className="opacity-90"
          />
      </div>
    </div>
  )
}
