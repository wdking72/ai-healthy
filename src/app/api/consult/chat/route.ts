import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import ConsultMessage from "@/lib/models/consultMessage"
import ConsultSession from "@/lib/models/consultSession"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    const payload = await verifyToken(token)
    const userId = payload.userId as string

    // 2. 解析请求体
    const { sessionId, message } = await request.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 })
    }

    await DBconnect()

    // 3. 获取或创建会话
    let session
    if (sessionId) {
      session = await ConsultSession.findById(sessionId)
      if (!session) {
        return NextResponse.json({ error: "会话不存在" }, { status: 404 })
      }
    } else {
      session = await ConsultSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        title: `心理AI助手-${new Date().toLocaleString("zh-CN")}`,
      })
    }

    // 4. 保存用户消息
    await ConsultMessage.create({
      sessionId: session._id,
      role: "user",
      content: message,
    })

    // 5. SSE 流式返回
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reply = "收到您的消息。我是AI心理助手，正在思考如何帮您...（后续接入大模型后，这里将返回真实的流式回复）"

        // 模拟逐字输出
        for (let i = 0; i < reply.length; i++) {
          const chunk = JSON.stringify({ content: reply[i] })
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
          await new Promise((resolve) => setTimeout(resolve, 30))
        }

        // 保存助手回复
        await ConsultMessage.create({
          sessionId: session._id,
          role: "assistant",
          content: reply,
        })

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: session._id.toString() })}\n\n`))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
