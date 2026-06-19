import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { createUISlice, type UISlice } from './slices/uiSlice'
import { createAuthSlice, type AuthSlice } from './slices/authSlice'
import { createConsultSlice, type ConsultSlice } from './slices/consultSlice'

// 后台全局状态：按 slice 组合 UI / 身份 / 咨询业务三大领域
export type BackStore = UISlice & AuthSlice & ConsultSlice

export const useBackStore = create<BackStore>()(
  devtools(
    persist(
      // 将三个 slice 合并为同一个 store
      (...a) => ({
        ...createUISlice(...a),
        ...createAuthSlice(...a),
        ...createConsultSlice(...a),
      }),
      {
        name: 'ai-healthy-back-store',
        storage: createJSONStorage(() => localStorage),
        // 只持久化 UI 状态，敏感信息（token、用户、业务数据）不落本地
        partialize: (state) => ({ selectedKey: state.selectedKey }),
        version: 0,
      }
    ),
    {
      name: 'BackStore',
      // 仅在开发环境启用 Redux DevTools，避免生产暴露内部状态
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// ---------- UI selectors ----------
export const useSelectedKey = () => useBackStore((state) => state.selectedKey)
export const useSetSelectedKey = () => useBackStore((state) => state.setSelectedKey)

// ---------- Auth selectors ----------
export const useUser = () => useBackStore((state) => state.user)
export const useIsAuthenticated = () => useBackStore((state) => state.isAuthenticated)
export const useAccessToken = () => useBackStore((state) => state.accessToken)
export const useRefreshToken = () => useBackStore((state) => state.refreshToken)
export const useSetUser = () => useBackStore((state) => state.setUser)
export const useSetTokens = () => useBackStore((state) => state.setTokens)
export const useLogout = () => useBackStore((state) => state.logout)

// ---------- Consult selectors ----------
export const useConsultSessions = () => useBackStore((state) => state.sessions)
export const useCurrentSessionId = () => useBackStore((state) => state.currentSessionId)
export const useCurrentMessages = () => useBackStore((state) => state.currentMessages)
export const useIsLoadingSessions = () => useBackStore((state) => state.isLoadingSessions)
export const useIsLoadingMessages = () => useBackStore((state) => state.isLoadingMessages)
