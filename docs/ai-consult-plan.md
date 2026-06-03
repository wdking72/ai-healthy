# AI 心理助手 — 对话功能设计方案

## 1. 概述

在现有 `consult` 页面基础上，接入大语言模型实现 AI 心理咨询对话功能。支持多渠道模型来源、多轮对话历史管理、混合角色模式。

---

## 2. 模型方案

### 2.1 模型来源

| 来源                       | 类型 | 付费方式                                 | 接口格式    |
| -------------------------- | ---- | ---------------------------------------- | ----------- |
| **硅基流动 (SiliconFlow)** | 默认 | 注册送免费额度，可调 DeepSeek-V2/Qwen 等 | OpenAI 兼容 |
| **DeepSeek 官方**          | 可选 | 按量付费 (~¥1/百万 token)                | OpenAI 兼容 |
| **自定义 API**             | 可选 | 用户自定                                 | OpenAI 兼容 |

### 2.2 用户配置界面

在 Message 头部新增 **设置按钮（齿轮图标）**，点击弹出 Modal 弹窗，包含：

- **模型来源选择**：硅基流动 / DeepSeek 官方 / 自定义
- **自定义配置**（选择"自定义"时显示）：
  - API 地址输入框（默认 `https://api.deepseek.com`）
  - API Key 输入框（密码模式）
- **默认模型选择**：根据来源动态展示可用模型列表
- **保存 / 取消** 按钮

配置持久化到 `localStorage`，每次请求时读取。

---

## 3. 对话架构 (LangChain.js)

### 3.1 核心 Chain 结构

使用 **LangChain.js** 框架编排多阶段处理链，代码放在 `src/lib/langChain.ts`：

```
用户输入
    │
    ▼
┌──────────────────────┐
│  ChatPromptTemplate   │ ← 组装 system prompt + 历史消息模板
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  RunnableSequence     │ ← 主执行链
│  ┌────────────────┐   │
│  │ 情绪预检测 Chain │   │ ← 轻量调用，输出情绪标签
│  │ (可选)          │   │
│  └──────┬─────────┘   │
│         ▼             │
│  ┌────────────────┐   │
│  │ 历史摘要 Chain   │   │ ← 超出窗口时触发，压缩历史
│  │ (条件执行)      │   │
│  └──────┬─────────┘   │
│         ▼             │
│  ┌────────────────┐   │
│  │ 回复生成 Chain   │   │ ← 主调用，流式输出回复
│  └────────────────┘   │
└────────────────────────┘
```

### 3.2 LangChain 配置 (`src/lib/langChain.ts`)

```typescript
// 核心职责：
// 1. 根据 modelSource 动态创建 ChatModel 实例
// 2. 编排 RunnableSequence
// 3. 处理上下文窗口管理
// 4. 流式输出支持

// 支持的模型来源：
// - 硅基流动: new ChatOpenAI({ apiKey, configuration: { baseURL: 'https://api.siliconflow.cn/v1' } })
// - DeepSeek: new ChatOpenAI({ apiKey, configuration: { baseURL: 'https://api.deepseek.com' } })
// - 自定义:   用户填入 baseURL + apiKey
```

### 3.2 上下文管理

- **短期记忆**：当前会话最近 N 轮对话（N 可配置，默认 20 轮）
- **长期记忆**：超过 N 轮后，触发历史摘要 Chain，将早期对话压缩为摘要
- **每次请求发送**：`System Prompt + 历史摘要 + 最近 N 轮消息 + 当前输入`

### 3.3 System Prompt（混合角色模式）

```
你是一位专业的 AI 心理助手，名叫"心理AI助手"。

== 角色定位 ==
默认以温暖、共情的倾听者角色与用户交流，像朋友一样陪伴。
当检测到用户存在明显的焦虑、抑郁、情绪危机等心理问题时，
自动切换到专业心理咨询师模式，使用 CBT、正念等疗法框架提供结构化建议。

== 行为准则 ==
- 始终以同理心回应，不评判、不建议化
- 不提供医疗诊断或处方建议
- 如检测到自杀/自伤风险，优先建议拨打心理危机热线（全国希望24热线：400-161-9995）
- 回复简洁自然，每次不超过 300 字
- 使用中文回应
```

---

## 4. 数据模型 (MongoDB)

### 4.1 Session 集合

```typescript
// models/consultSession.ts
interface IConsultSession {
  _id: ObjectId;
  userId: ObjectId; // 关联用户
  title: string; // 会话标题，自动生成
  summary: string; // 会话历史摘要（超出窗口后生成）
  modelSource: string; // 使用的模型来源
  modelName: string; // 使用的具体模型名
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Message 集合

```typescript
// models/consultMessage.ts
interface IConsultMessage {
  _id: ObjectId;
  sessionId: ObjectId; // 关联会话
  role: "user" | "assistant" | "system";
  content: string;
  emotionTag?: string; // 情绪标签（预检测输出）
  createdAt: Date;
}
```

---

## 5. API 路由

### 5.1 对话接口

```
POST /api/consult/chat
Body: {
  sessionId: string,
  message: string,
  modelSource?: string,    // 可选，覆盖用户配置
  modelName?: string
}
Response: {
  sessionId: string,
  reply: string,           // SSE 流式返回
  emotionTag?: string
}
```

采用 **SSE (Server-Sent Events)** 流式输出，前端逐字显示。

### 5.2 会话管理接口

```
GET    /api/consult/sessions          // 获取用户会话列表
POST   /api/consult/sessions          // 创建新会话
DELETE /api/consult/sessions/:id      // 删除会话
GET    /api/consult/sessions/:id/messages  // 获取会话消息历史
```

---

## 6. 前端组件修改

### 6.1 Message 组件（修改）

```
┌─────────────────────────────────────────┐
│  [❤] 心理AI助手           [+] [⚙️]    │  ← 橙色渐变头部 (90px)
│  您的心理助手...                          │
├─────────────────────────────────────────┤
│                                         │
│           消息气泡列表                     │  ← 消息展示区 (flex-1)
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────┐ [发送]    │  ← 底部输入区
│  │ 多行输入框...            │            │
│  └─────────────────────────┘            │
└─────────────────────────────────────────┘
```

- **头部**：保留现有布局，加号（新建会话）旁新增设置按钮（齿轮图标）
- **消息区域**：渲染消息气泡，用户消息右对齐，AI 消息左对齐
- **输入区域**：多行文本框 + 发送按钮，Enter 发送，Shift+Enter 换行

### 6.2 SessionHistory 组件（修改）

- 从 MongoDB 真实数据加载会话列表
- 点击切换当前会话
- 新建会话后自动添加到列表顶部

### 6.3 模型设置 Modal

```
┌─ 模型设置 ──────────────────────┐
│                                 │
│  模型来源:  [硅基流动 ▼]         │
│                                 │
│  可用模型:  [DeepSeek-V2 ●]    │
│             [Qwen2.5 ○]        │
│                                 │
│  ┌─────────────────────────┐   │
│  │ API Key (可选)           │   │
│  └─────────────────────────┘   │
│                                 │
│         [取消]    [保存]        │
└─────────────────────────────────┘
```

---

## 7. 执行步骤

| 步骤       | 内容                                        | 预估 |
| ---------- | ------------------------------------------- | ---- |
| **Step 1** | 创建 Mongoose 数据模型（session + message） | 1h   |
| **Step 2** | 实现后端 API 路由（chat SSE + CRUD）        | 3h   |
| **Step 3** | 实现 LLM 调用服务层（多来源兼容）           | 2h   |
| **Step 4** | 修改 Message 组件（消息区域 + 输入框）      | 2h   |
| **Step 5** | 实现模型设置 Modal                          | 1h   |
| **Step 6** | 修改 SessionHistory（真实数据对接）         | 1h   |
| **Step 7** | 联调测试                                    | 1h   |

---

## 8. 技术依赖

```json
{
  "dependencies": {
    "@langchain/core": "^0.3.0",
    "@langchain/openai": "^0.4.0",
    "langchain": "^0.3.0"
  }
}
```

使用 `@langchain/core` + `@langchain/openai` 编排 Chain，通过动态配置 `baseURL` 和 `apiKey` 实现多模型来源切换，流式输出通过 LangChain 的 `StreamEvent` 或 `Iterator` 机制实现。
