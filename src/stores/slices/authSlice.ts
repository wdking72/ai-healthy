import { StateCreator } from 'zustand'
import type { UserProfile } from '@/lib/types/domain'

// 身份认证状态：仅存内存，不持久化，便于后续接入 JWT 双 token
export interface AuthSlice {
  user: UserProfile | null
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  setUser: (user: UserProfile | null) => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => void
}

const initialAuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...initialAuthState,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setTokens: (tokens) => set(tokens),
  logout: () => set(initialAuthState),
})
