import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import ConsultMessage from "@/lib/models/consultMessage"
import ConsultSession from "@/lib/models/consultSession"
import { generateReply, detectEmotion, summarizeHistory } from "@/lib/langChain"
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
    const { sessionId, message, modelSource, modelName, apiKey, baseURL, maxHistory = 20 } = await request.json()
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

    // 4. 保存用户消息（获取 ID 用于后续情绪检测更新）
    const userMessage = await ConsultMessage.create({
      sessionId: session._id,
      role: "user",
      content: message,
    })
    const userMessageId = userMessage._id

    // 5. 加载历史消息 + 长期记忆摘要管理
    const totalMessages = await ConsultMessage.countDocuments({ sessionId: session._id })
    let history: { role: string; content: string }[]
    let summary: string | undefined

    if (totalMessages > maxHistory + 1) {
      // 消息超过阈值，需要加载摘要
      const allMessages = await ConsultMessage.find({ sessionId: session._id })
        .sort({ createdAt: -1 })
        .select("role content")
        .lean()

      const ordered = (allMessages as { role: string; content: string }[]).reverse()

      // 最新一条是当前用户输入，不要作为历史；取最近 maxHistory 条作为短期记忆
      const recentMessages = ordered.slice(-maxHistory - 1, -1)
      // 这之前的消息需要摘要（只摘一次，存到 session.summary）
      const oldMessages = ordered.slice(0, ordered.length - maxHistory - 1)

      if (!session.summary && oldMessages.length > 0) {
        // 异步生成摘要（不阻塞当前请求，摘要生成完再更新 session）
        summarizeHistory(oldMessages, {
          source: (modelSource || session.modelSource) as "siliconflow" | "deepseek" | "custom",
          apiKey,
          baseURL,
          modelName,
        }).then((summaryText) => {
          ConsultSession.findByIdAndUpdate(session._id, { summary: summaryText }).catch(console.error)
        }).catch(console.error)
      }

      summary = session.summary || undefined
      history = recentMessages
    } else {
      // 消息未超阈值，直接从数据库加载最近的历史
      const historyMessages = await ConsultMessage.find({ sessionId: session._id })
        .sort({ createdAt: -1 })
        .limit(maxHistory)
        .select("role content")
        .lean()

      history = (historyMessages as { role: string; content: string }[])
        .reverse()
        .slice(0, -1) // 去掉最新一条（当前输入）
      summary = session.summary || undefined
    }

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

          // 并行执行情绪检测（不阻塞流式回复）
          detectEmotion(message, modelConfig)
            .then((tag) => {
              ConsultMessage.findByIdAndUpdate(userMessageId, { emotionTag: tag }).catch(console.error)
              if (tag === "危机") {
                // 标记会话为危机状态，后台可据此筛选展示
                ConsultSession.findByIdAndUpdate(session._id, { crisisFlagged: true }).catch(console.error)
              }
            })
            .catch((err) => console.error("Emotion detection error:", err))

          for await (const chunk of generateReply(message, history, modelConfig, summary)) {
            fullReply += chunk
            const data = JSON.stringify({ content: chunk })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        } catch (err) {
          console.error("LLM stream error:", err)
          const errorMsg = err instanceof Error ? `抱歉，AI 回复出现错误：${err.message}` : "抱歉，AI 回复出现错误，请稍后重试。"
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
