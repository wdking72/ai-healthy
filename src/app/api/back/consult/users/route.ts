import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import DBconnect from "@/lib/db"
import User from "@/lib/models/user"

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

    await DBconnect()

    const users = await User.find({ role: "user" })
      .select("username email nickname createdAt")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("GET back users error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
