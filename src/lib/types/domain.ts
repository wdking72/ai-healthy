export interface UserProfile {
  id: string
  username: string
  nickname?: string
  role: 'user' | 'admin'
}

export interface ConsultSession {
  id: string
  userId: string
  title: string
  summary: string
  modelSource: string
  modelName: string
  crisisFlagged: boolean
  createdAt: string
  updatedAt: string
}

export interface ConsultMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  emotionTag?: string
  createdAt: string
  updatedAt: string
}
