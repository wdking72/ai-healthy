import { create } from "zustand";

interface BackStoreState {
  selectedKey: string
  setSelectedKey: (key: string) => void
}

export const BackStore = create<BackStoreState>((set) => ({
  selectedKey: 'dashboard',
  setSelectedKey: (key: string) => set({ selectedKey: key}),
}))
