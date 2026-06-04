import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import ConsultSession from "@/lib/models/consultSession"
import ConsultMessage from "@/lib/models/consultMessage"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 })
    }

    const { id } = await params

    await DBconnect()

    const session = await ConsultSession.findById(id)
      .select("title summary userId createdAt updatedAt")
      .lean()

    if (!session) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 })
    }

    // 获取该会话的所有情绪标签（按时间排序）
    const emotionMessages = await ConsultMessage.find({
      sessionId: id,
      emotionTag: { $ne: "" },
    })
      .sort({ createdAt: 1 })
      .select("role emotionTag content createdAt")
      .lean()

    // 获取消息总数
    const messageCount = await ConsultMessage.countDocuments({ sessionId: id })

    return NextResponse.json({
      session: {
        ...session,
        _id: session._id.toString(),
      },
      emotionTags: emotionMessages.map((m) => ({
        role: m.role,
        tag: m.emotionTag,
        content: m.content.slice(0, 100),
        time: m.createdAt,
      })),
      messageCount,
    })
  } catch (error) {
    console.error("GET session overview error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
