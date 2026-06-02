'use server'
import DBconnect from "@/lib/db"
import { UserType } from "@/lib/actions/type"
import User from "@/lib/models/user"
import { hashPassword } from "@/utils/psdHash"

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
      return { success: false, message: '该邮箱已被注册' }
    }
    return { success: false, message: '注册失败，请稍后重试' }
  }
}
