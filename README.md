# AI 心理健康助手

基于 Next.js 16 全栈重构的 AI 心理咨询平台，聚焦 AI 即时咨询核心能力，为用户提供 7×24 小时可及的心理支持服务，同时为管理员提供会话管理与数据分析能力。

> 本项目由 Vue 3 版本重构而来，原项目地址：[gitee.com/king-of-wd/ai-psychological-assistant](https://gitee.com/king-of-wd/ai-psychological-assistant)

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router)、React 19、TypeScript |
| 样式 | Tailwind CSS 4、Ant Design 6 |
| AI 引擎 | LangChain.js、@langchain/openai |
| 数据库 | MongoDB、Mongoose |
| 状态管理 | Zustand |
| 认证 | jose (JWT)、bcryptjs |
| 流式通信 | SSE (Server-Sent Events) |

---

## 核心功能

### 前台用户端

- **AI 心理咨询对话** — 基于 LangChain.js 编排多模型对话链，支持流式逐字输出
- **多模型来源切换** — 支持硅基流动、DeepSeek、自定义 API 三种来源，用户侧灵活配置
- **会话历史管理** — 创建、切换、查看历史会话
- **情绪检测** — 并行执行情绪分类（正常/焦虑/抑郁/愤怒/悲伤/危机），零延迟感知用户情绪

### 后台管理端

- **会话列表** — 查看所有用户会话，支持危机标记筛选
- **消息详情** — 查看单条会话的完整对话记录与情绪标签
- **用户管理** — 查看注册用户列表
- **数据分析** — 会话统计与情绪趋势概览

---

## 项目亮点

### 实时流式对话

采用 SSE (Server-Sent Events) 替代传统轮询，后端通过 LangChain.js `chain.stream()` 实现逐字流式输出，前端基于 ReadableStream 实时解析渲染打字机效果，首字节响应时间控制在 500ms 内。

### 上下文管理与长期记忆

设计"短期记忆 + 长期摘要"双层上下文管理系统：

- **短期记忆**：保留最近 N 轮对话（默认 20 轮，可配置）
- **长期摘要**：当消息总数超过阈值时，异步调用 LLM 生成历史摘要并持久化至 MongoDB，后续请求将摘要作为 system prompt 注入，实现超长对话的上下文压缩
- **并行情绪检测**：fire-and-forget 模式执行，不增加首字延迟

### 多模型兼容

基于 LangChain.js `ChatOpenAI` 封装统一模型层，通过动态配置 `baseURL` 与 `apiKey` 实现三源切换，模型配置持久化至 localStorage。

### 权限管理

基于角色的访问控制（RBAC），区分前台用户与后台管理员；JWT Cookie 无状态认证，Next.js Middleware 实现路由级权限拦截。

---

## 快速开始

### 环境要求

- Node.js >= 20
- MongoDB 实例

### 安装依赖

```bash
npm install
```

### 环境变量

在项目根目录创建 `.env.local` 文件：

```env
# 数据库
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# JWT 密钥
JWT_SECRET=your-jwt-secret-key

# AI 模型 API Key（至少配置一个）
SILICONFLOW_API_KEY=your-siliconflow-key
DEEPSEEK_API_KEY=your-deepseek-key
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 项目结构

```
ai-healthy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证相关
│   │   │   ├── consult/       # 前台咨询 API（SSE 流式对话）
│   │   │   └── back/          # 后台管理 API
│   │   ├── front/consult/     # 前台咨询页面
│   │   ├── back/              # 后台管理页面
│   │   │   ├── dashboard/     # 数据分析
│   │   │   └── consultation/  # 咨询记录
│   │   ├── auth/              # 登录/注册
│   │   └── page.tsx           # 首页
│   ├── components/
│   │   ├── frontend/consult/  # 前台咨询组件
│   │   ├── backend/           # 后台布局组件
│   │   ├── home/              # 首页组件
│   │   └── auth/              # 认证组件
│   ├── lib/
│   │   ├── langChain.ts       # LangChain 对话引擎
│   │   ├── models/            # Mongoose 数据模型
│   │   ├── jwt.ts             # JWT 工具
│   │   └── db.ts              # 数据库连接
│   ├── stores/                # Zustand 状态管理
│   └── utils/                 # 工具函数
├── docs/                      # 设计文档
├── public/                    # 静态资源
└── package.json
```

---

## API 概览

### 前台 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/consult/chat` | SSE 流式对话 |
| GET | `/api/consult/sessions` | 获取用户会话列表 |
| POST | `/api/consult/sessions` | 创建新会话 |
| GET | `/api/consult/sessions/:id/messages` | 获取会话消息历史 |
| DELETE | `/api/consult/sessions/:id` | 删除会话 |

### 后台 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/back/consult/users` | 获取用户列表 |
| GET | `/api/back/consult/sessions` | 获取所有会话 |
| GET | `/api/back/consult/sessions/:id/overview` | 获取会话概览 |

---

## 与原项目的差异

本项目由原 Vue 3 版本重构而来，聚焦核心 AI 咨询能力，以下功能在重构中暂未保留：

- 情绪日记追踪模块（心情记录、可视化图表）
- 心理知识库模块
- 通用组件封装（TableSearch、MarkdownRenderer 等）

---

## 开源协议

MIT License
