'use client'
import { Form, Button, Input, message } from "antd"
import Link from "next/link"
import { redirect } from "next/navigation"
import { loginUser } from "@/lib/actions/auth"
import { LoginUser } from "@/lib/actions/type"
import { useState } from "react"

export default function Login() {
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: unknown) => {
    setLoading(true)
    const result = await loginUser(values as LoginUser)
    if (result.success) {
      message.success('登录成功')
      // 根据角色跳转不同的页面
      if (result.role === 'admin') {
        redirect('/back/dashboard')
      } else {
        redirect('/')
      }
    } else {
      message.error(result.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-8">
      {/* 返回首页 */}
      <p className="mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-800">
          ← 返回首页
        </Link>
      </p>

      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">登录您的账户</h1>
        <p className="text-gray-500">输入您的登录信息</p>
      </div>

      {/* 登录表单 */}
      <Form
        name="login"
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="用户名或邮箱"
          name="username"
          rules={[{ required: true, message: '请输入用户名或邮箱' }]}
        >
          <Input placeholder="请输入用户名或邮箱" size="large" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" size="large" />
        </Form.Item>

        <Form.Item className="mt-8">
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>

      <p className="text-center text-gray-600 mt-6">
        还没有账号？<Link href="/auth/rigester" className="text-blue-500 hover:text-blue-600">去注册</Link>
      </p>
    </div>
  )
}
