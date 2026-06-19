import { StateCreator } from 'zustand'

// 后台 UI 状态：导航选中项等可持久化的界面配置
export interface UISlice {
  selectedKey: string
  setSelectedKey: (key: string) => void
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  selectedKey: 'dashboard',
  setSelectedKey: (key) => set({ selectedKey: key }),
})
