'use client'
import { Form, Button, Input } from "antd"
import Link from "next/link"

export default function Login() {
  const onFinish = (values: unknown) => {
    console.log('登录表单数据:', values)
    // TODO: 处理登录逻辑
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
          <Button type="primary" htmlType="submit" size="large" block>
            登录
          </Button>
        </Form.Item>
      </Form>

      {/* 去注册 */}
      <p className="text-center text-gray-600 mt-6">
        还没有账号？<Link href="/auth/rigester" className="text-blue-500 hover:text-blue-600">去注册</Link>
      </p>
    </div>
  )
}
