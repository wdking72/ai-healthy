'use client'
import { Form, Button, Input, message } from "antd"
import Link from "next/link"
import { redirect } from "next/navigation"
import { addUser } from "@/lib/actions/auth"
import { UserType } from "@/lib/actions/type"

export default function Register() {
  const [form] = Form.useForm()
  const onFinish = async (values: unknown) => {
    // 处理注册逻辑
    const result = await addUser(values as UserType)
    if (result.success) {
      // 注册成功，跳转到登录页面
      message.success('注册成功')
      redirect('/auth/login')
    } else {
      // 注册失败，显示错误信息
      message.error(result.message)
    }
    form.resetFields()
  }

  return (
    <div className="w-full max-w-md px-8">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建您的账户</h1>
        <p className="text-gray-500">请填写注册信息</p>
      </div>

      {/* 注册表单 */}
      <Form
        name="register"
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" size="large" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input placeholder="请输入邮箱" size="large" />
        </Form.Item>

        <Form.Item
          label="昵称"
          name="nickname"
        >
          <Input placeholder="请输入昵称（可选）" size="large" />
        </Form.Item>

        <Form.Item
          label="手机号"
          name="phone"
        >
          <Input placeholder="请输入手机号（可选）" size="large" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" size="large" />
        </Form.Item>

        <Form.Item
          label="确认密码"
          name="confirmPassword"
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password placeholder="请确认密码" size="large" />
        </Form.Item>

        <Form.Item className="mt-8">
          <Button type="primary" htmlType="submit" size="large" block>
            注册
          </Button>
        </Form.Item>
      </Form>

      {/* 去登录 */}
      <p className="text-center text-gray-600 mt-6">
        已有账号？<Link href="/auth/login" className="text-blue-500 hover:text-blue-600">去登录</Link>
      </p>
    </div>
  )
}
