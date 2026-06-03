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
    const userId = payload.userId as string

    const { id } = await params

    await DBconnect()

    // 验证会话属于当前用户
    const session = await ConsultSession.findOne({ _id: id, userId })
    if (!session) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 })
    }

    const messages = await ConsultMessage.find({ sessionId: id })
      .sort({ createdAt: 1 })
      .select("role content emotionTag createdAt") // 仅返回必要字段
      .lean() // 转换为普通对象 ，避免返回 Mongoose 文档对象

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("GET messages error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
