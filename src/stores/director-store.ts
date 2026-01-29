'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

interface DirectorState {
  isDirector: boolean
  directorName: string
  currentDirector: string | null
  markedLineIndex: number | null
  isConnected: boolean
  isReconnecting: boolean
  credentials: {
    name: string
    password: string
  }

  setIsDirector: (value: boolean) => void
  setDirectorName: (name: string) => void
  setCurrentDirector: (name: string | null) => void
  setMarkedLineIndex: (index: number | null) => void
  setIsConnected: (connected: boolean) => void
  setIsReconnecting: (reconnecting: boolean) => void
  setCredentials: (name: string, password: string) => void
  clearCredentials: () => void
}

export const useDirectorStore = create<DirectorState>()(
  persist(
    (set) => ({
      isDirector: false,
      directorName: '',
      currentDirector: null,
      markedLineIndex: null,
      isConnected: false,
      isReconnecting: false,
      credentials: {
        name: '',
        password: '',
      },

      setIsDirector: (isDirector) => set({ isDirector }),

      setDirectorName: (directorName) => set({ directorName }),

      setCurrentDirector: (currentDirector) => set({ currentDirector }),

      setMarkedLineIndex: (markedLineIndex) => set({ markedLineIndex }),

      setIsConnected: (isConnected) => set({ isConnected }),

      setIsReconnecting: (isReconnecting) => set({ isReconnecting }),

      setCredentials: (name, password) =>
        set({ credentials: { name, password } }),

      clearCredentials: () =>
        set({
          credentials: { name: '', password: '' },
          isDirector: false,
          directorName: '',
        }),
    }),
    {
      name: STORAGE_KEYS.DIRECTOR_NAME,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        credentials: state.credentials,
      }),
    }
  )
)
