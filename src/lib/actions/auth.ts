'use server'
import DBconnect from "@/lib/db"
import { UserType, LoginUser } from "@/lib/actions/type"
import User from "@/lib/models/user"
import { hashPassword, comparePassword } from "@/utils/psdHash"
import { signToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export const addUser = async (user: UserType) => {
  await DBconnect() // 连接数据库
  const newUser = new User(user)
  // 校验逻辑
  if (!newUser.username) {
    return { success: false, message: '用户名不能为空' }
  }
  if (!newUser.email) {
    return { success: false, message: '邮箱不能为空' }
  }
  if (!newUser.password) {
    return { success: false, message: '密码不能为空' }
  }

  // 密码加密
  newUser.password = await hashPassword(newUser.password)
  try {
    await newUser.save()
    return { success: true, message: '注册成功' }
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return { success: false, message: '该邮箱已被注册', error: error.message }
    }
    return { success: false, message: '注册失败，请稍后重试' }
  }
}

export const loginUser = async (user: LoginUser) => {
  await DBconnect()

  const existingUser = await User.findOne({
    // 或条件查询用户名或邮箱是否存在
    $or: [{ username: user.username }, { email: user.username }]
  })
  if (!existingUser) {
    return { success: false, message: '用户不存在' }
  }
  // 密码对比
  const isPasswordValid = await comparePassword(user.password, existingUser.password)
  if (!isPasswordValid) {
    return { success: false, message: '密码错误' }
  }
  // 使用jwt生成token，存储到cookie中
  const token = await signToken({
    userId: existingUser._id.toString(),
    username: existingUser.username,
    role: existingUser.role,
  })
  // 存储token到cookie中
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true, // 仅在http请求中传输，防止被js访问
    secure: process.env.NODE_ENV === 'production', // 生产环境下使用https
    sameSite: 'lax', // 仅在同源请求中传输，防止被其他域名访问
    // 其他配置
    maxAge: 7 * 24 * 60 * 60, // 7天过期
    path: '/', // 所有路径都可以访问
  })

  return { success: true, message: '登录成功' }
}


