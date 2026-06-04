import { create } from "zustand";

interface BackStoreState {
  selectedKey: string
  setSelectedKey: (key: string) => void
}

export const BackStore = create<BackStoreState>((set) => ({
  selectedKey: 'data-analysis',
  setSelectedKey: (key: string) => set({ selectedKey: key}),
}))
