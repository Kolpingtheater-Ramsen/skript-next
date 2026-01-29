'use client'

import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  settingsOpen: boolean
  currentScene: string

  setSidebarOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setCurrentScene: (scene: string) => void
  toggleSidebar: () => void
  toggleSettings: () => void
  closeAll: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  settingsOpen: false,
  currentScene: '',

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

  setCurrentScene: (currentScene) => set({ currentScene }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen, settingsOpen: false })),

  toggleSettings: () =>
    set((state) => ({ settingsOpen: !state.settingsOpen, sidebarOpen: false })),

  closeAll: () => set({ sidebarOpen: false, settingsOpen: false }),
}))
