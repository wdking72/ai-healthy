import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import ConsultSession from "@/lib/models/consultSession"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    const payload = await verifyToken(token)
    const userId = payload.userId as string

    await DBconnect()

    const sessions = await ConsultSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select("title createdAt updatedAt")
      .lean()

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("GET sessions error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    const payload = await verifyToken(token)
    const userId = payload.userId as string

    await DBconnect()

    const session = await ConsultSession.create({
      userId,
      title: `心理AI助手-${new Date().toLocaleString("zh-CN")}`,
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error("POST session error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
