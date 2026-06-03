import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"

// --------------- 类型 & 配置 ---------------

export interface ModelConfig {
  source: "siliconflow" | "deepseek" | "custom"
  apiKey?: string
  baseURL?: string
  modelName?: string
}

const MODEL_DEFAULTS: Record<ModelConfig["source"], { baseURL: string; modelName: string }> = {
  siliconflow: {
    baseURL: "https://api.siliconflow.cn/v1",
    modelName: "Qwen/Qwen3-8B",
  },
  deepseek: {
    baseURL: "https://api.deepseek.com",
    modelName: "deepseek-chat",
  },
  custom: {
    baseURL: "",
    modelName: "",
  },
}

// --------------- 创建 ChatModel ---------------

function createChatModel(config: ModelConfig, overrides?: { temperature?: number; streaming?: boolean }) {
  const defaults = MODEL_DEFAULTS[config.source]
  return new ChatOpenAI({
    apiKey: config.apiKey || process.env[config.source === "siliconflow" ? "SILICONFLOW_API_KEY" : "DEEPSEEK_API_KEY"] || "",
    configuration: {
      baseURL: config.baseURL || defaults.baseURL,
    },
    model: config.modelName || defaults.modelName,
    temperature: overrides?.temperature ?? 0.7,
    maxTokens: 2048,
    streaming: overrides?.streaming ?? true,
  })
}

// --------------- System Prompt ---------------

const SYSTEM_PROMPT = `你是心理AI助手，一名专业的AI心理咨询师。

== 角色定位 ==
默认以温暖、共情的倾听者角色与用户交流，像朋友一样陪伴。
当检测到用户存在明显的焦虑、抑郁、情绪危机等心理问题时，
自动切换到专业心理咨询师模式，使用 CBT、正念等疗法框架提供结构化建议。

== 行为准则 ==
- 始终以同理心回应，不评判、不建议化
- 不提供医疗诊断或处方建议
- 如检测到自杀/自伤风险，优先建议拨打心理危机热线（全国希望24热线：400-161-9995）
- 回复简洁自然，每次不超过 300 字
- 使用中文回应`

// --------------- 主链：生成回复 ---------------

export async function* generateReply(
  userMessage: string,
  history: { role: string; content: string }[],
  modelConfig: ModelConfig
): AsyncGenerator<string, { sessionId?: string }> {
  const model = createChatModel(modelConfig)

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ...history.map((msg) => [msg.role === "assistant" ? "ai" : "human", msg.content] as [string, string]),
    ["human", "{input}"],
  ])

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ])

  const stream = await chain.stream({ input: userMessage })

  for await (const chunk of stream) {
    yield chunk
  }

  return {}
}

// --------------- 辅助：简短情绪检测 ---------------

export async function detectEmotion(
  message: string,
  modelConfig: ModelConfig
): Promise<string> {
  const model = createChatModel(modelConfig, { temperature: 0, streaming: false })

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "你是一个情绪分类器。只用以下标签之一回复：正常, 焦虑, 抑郁, 愤怒, 悲伤, 危机。不要输出其他任何内容。"],
    ["human", message],
  ])

  const chain = RunnableSequence.from([prompt, model, new StringOutputParser()])
  const result = await chain.invoke({})

  return result.trim()
}

// --------------- 辅助：历史摘要 ---------------

export async function summarizeHistory(
  history: { role: string; content: string }[],
  modelConfig: ModelConfig
): Promise<string> {
  const model = createChatModel(modelConfig, { temperature: 0.3, streaming: false })

  const conversationText = history
    .map((m) => `${m.role === "user" ? "用户" : "AI"}: ${m.content}`)
    .join("\n")

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "请将以下心理咨询对话浓缩为一段 100 字以内的中文摘要，保留关键情绪线索和话题。"],
    ["human", conversationText],
  ])

  const chain = RunnableSequence.from([prompt, model, new StringOutputParser()])
  const result = await chain.invoke({})

  return result.trim()
}
