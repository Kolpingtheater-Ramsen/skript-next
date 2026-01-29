'use client'

import { create } from 'zustand'
import type { ScriptRow, Actor } from '@/types'
import { generateSceneMicCues } from '@/lib/mic-cue-generator'

interface ScriptState {
  playId: string
  scriptData: ScriptRow[]
  actors: Actor[]
  isLoading: boolean
  error: string | null

  setPlayId: (id: string) => void
  setScriptData: (data: ScriptRow[]) => void
  setActors: (actors: Actor[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadScript: (playId: string) => Promise<void>
}

export const useScriptStore = create<ScriptState>((set) => ({
  playId: 'default',
  scriptData: [],
  actors: [],
  isLoading: false,
  error: null,

  setPlayId: (playId) => set({ playId }),

  setScriptData: (scriptData) => set({ scriptData }),

  setActors: (actors) => set({ actors }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  loadScript: async (playId: string) => {
    set({ isLoading: true, error: null, playId })

    try {
      // Fetch script data - in production this would call the Flask API
      const response = await fetch(`/api/script/${playId}`)
      if (!response.ok) {
        throw new Error(`Failed to load script: ${response.statusText}`)
      }

      const data = await response.json()
      const scriptWithMicCues = generateSceneMicCues(data.script || [])
      set({
        scriptData: scriptWithMicCues,
        actors: data.actors || [],
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load script:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load script',
        isLoading: false,
      })
    }
  },
}))
