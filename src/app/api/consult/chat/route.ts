import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import ConsultMessage from "@/lib/models/consultMessage"
import ConsultSession from "@/lib/models/consultSession"
import { generateReply } from "@/lib/langChain"
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

    // 2. 解析请求体（含模型配置）
    const { sessionId, message, modelSource, modelName, apiKey, baseURL } = await request.json()
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
      // 更新会话使用的模型信息
      if (modelSource) {
        session.modelSource = modelSource
        if (modelName) session.modelName = modelName
        await session.save()
      }
    } else {
      session = await ConsultSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        title: `心理AI助手-${new Date().toLocaleString("zh-CN")}`,
        modelSource: modelSource || "siliconflow",
        modelName: modelName || "",
      })
    }

    // 4. 保存用户消息
    await ConsultMessage.create({
      sessionId: session._id,
      role: "user",
      content: message,
    })

    // 5. 加载历史消息用于上下文
    const historyMessages = await ConsultMessage.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("role content")
      .lean()

    // 历史消息从旧到新排列（去掉刚发的用户消息作为输入，其余作为上下文）
    const history = (historyMessages as { role: string; content: string }[])
      .reverse()
      .slice(0, -1) // 去掉最新一条（当前输入），因为会作为 input 传入

    // 6. SSE 流式返回
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = ""

        try {
          const source = (modelSource || session.modelSource) as "siliconflow" | "deepseek" | "custom"
          const modelConfig = {
            source,
            apiKey,
            baseURL,
            modelName,
          }

          for await (const chunk of generateReply(message, history, modelConfig)) {
            fullReply += chunk
            const data = JSON.stringify({ content: chunk })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        } catch (err) {
          console.error("LLM stream error:", err)
          const errorMsg = "抱歉，AI 回复出现错误，请稍后重试。"
          fullReply = errorMsg
          const data = JSON.stringify({ content: errorMsg })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        // 保存完整助手回复
        await ConsultMessage.create({
          sessionId: session._id,
          role: "assistant",
          content: fullReply,
        })
        // 发送完成信号
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: session._id.toString() })}\n\n`)
        )
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
