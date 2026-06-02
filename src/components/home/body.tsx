'use client'
import Image from "next/image";
import { Button } from "antd";




export default function Body() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'linear-gradient(90deg, rgb(74, 156, 140) 0%, rgb(61, 138, 122) 100%) rgba(74, 156, 140, 0.95)' }}>
      <div className="flex items-center justify-between max-w-6xl w-full px-10">
        {/* 左侧文案 */}
        <div className="text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-2">一次温暖的对话</h1>
          <h2 className="text-4xl font-bold text-yellow-300 mb-6">化孤独为慰藉</h2>
          <p className="text-lg mb-8 leading-relaxed opacity-90">
            每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的链接温暖您的每一天
          </p>
          <div className="flex gap-4">
            <Button size="large" className="bg-white text-[#4A9B8E] border-white hover:bg-gray-100 hover:text-[#4A9B8E] font-medium px-6">
              开始倾诉，获得陪伴
            </Button>
            <Button size="large" ghost variant="outlined" className="bg-transparent text-white border-white hover:bg-white/10 font-medium px-6">
              记录心情，释放情感
            </Button>
          </div>
        </div>

        {/* 右侧机器人图标 */}
        <div className="w-64 h-64 rounded-full bg-white/20 flex items-center justify-center shadow-md " 
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
            width={150}
            height={150}
            className="opacity-90"
          />
        </div>
      </div>
    </div>
  );
}
