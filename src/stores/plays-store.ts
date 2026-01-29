'use client'

import { create } from 'zustand'

interface Play {
  id: string
  name: string
}

interface PlaysState {
  plays: Play[]
  isLoading: boolean
  error: string | null
  loadPlays: () => Promise<void>
}

export const usePlaysStore = create<PlaysState>((set) => ({
  plays: [],
  isLoading: false,
  error: null,

  loadPlays: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/plays')
      if (!response.ok) {
        throw new Error('Failed to load plays')
      }
      const plays = await response.json()
      set({ plays, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
