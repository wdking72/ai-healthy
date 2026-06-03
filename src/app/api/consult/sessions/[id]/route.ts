import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import ConsultSession from "@/lib/models/consultSession"
import ConsultMessage from "@/lib/models/consultMessage"

export async function DELETE(
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

    const session = await ConsultSession.findOne({ _id: id, userId })
    if (!session) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 })
    }

    // 删除会话及其所有消息
    await ConsultSession.deleteOne({ _id: id })
    await ConsultMessage.deleteMany({ sessionId: id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE session error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
