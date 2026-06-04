import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import ConsultSession from "@/lib/models/consultSession"
import ConsultMessage from "@/lib/models/consultMessage"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "缺少 userId 参数" }, { status: 400 })
    }

    await DBconnect()

    const sessions = await ConsultSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select("title summary createdAt updatedAt crisisFlagged")
      .lean()

    // 为每个会话附上情绪标签概览
    const sessionsWithEmotion = await Promise.all(
      sessions.map(async (session) => {
        const emotionTags = await ConsultMessage.find({
          sessionId: session._id,
          emotionTag: { $ne: "" },
        })
          .sort({ createdAt: 1 })
          .select("emotionTag createdAt")
          .lean()

        return {
          ...session,
          _id: session._id.toString(),
          emotionTags: emotionTags.map((m) => ({
            tag: m.emotionTag,
            time: m.createdAt,
          })),
          messageCount: await ConsultMessage.countDocuments({ sessionId: session._id }),
        }
      })
    )

    return NextResponse.json({ sessions: sessionsWithEmotion })
  } catch (error) {
    console.error("GET back sessions error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
