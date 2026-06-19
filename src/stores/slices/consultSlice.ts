import { StateCreator } from 'zustand'
import type { ConsultSession, ConsultMessage } from '@/lib/types/domain'

// 咨询业务状态：会话列表、当前会话消息、加载状态等，仅存内存
export interface ConsultSlice {
  sessions: ConsultSession[]
  currentSessionId: string | null
  currentMessages: ConsultMessage[]
  isLoadingSessions: boolean
  isLoadingMessages: boolean
  setSessions: (sessions: ConsultSession[]) => void
  setCurrentSessionId: (id: string | null) => void
  setCurrentMessages: (messages: ConsultMessage[]) => void
  appendMessage: (message: ConsultMessage) => void
  setLoadingSessions: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  resetConsult: () => void
}

const initialConsultState = {
  sessions: [],
  currentSessionId: null,
  currentMessages: [],
  isLoadingSessions: false,
  isLoadingMessages: false,
}

export const createConsultSlice: StateCreator<ConsultSlice> = (set) => ({
  ...initialConsultState,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
  setCurrentMessages: (currentMessages) => set({ currentMessages }),
  appendMessage: (message) =>
    set((state) => ({ currentMessages: [...state.currentMessages, message] })),
  setLoadingSessions: (isLoadingSessions) => set({ isLoadingSessions }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  resetConsult: () => set(initialConsultState),
})
