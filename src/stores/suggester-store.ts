'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ScriptRow } from '@/types'

interface SuggesterState {
  presentActors: Set<string>
  toggleActor: (actor: string) => void
  toggleAllActors: (actors: string[], selectAll: boolean) => void
  setPresentActors: (actors: string[]) => void
  isActorPresent: (actor: string) => boolean
}

export const useSuggesterStore = create<SuggesterState>()(
  persist(
    (set, get) => ({
      presentActors: new Set<string>(),

      toggleActor: (actor) =>
        set((state) => {
          const newSet = new Set(state.presentActors)
          if (newSet.has(actor)) {
            newSet.delete(actor)
          } else {
            newSet.add(actor)
          }
          return { presentActors: newSet }
        }),

      toggleAllActors: (actors, selectAll) =>
        set(() => ({
          presentActors: selectAll ? new Set(actors) : new Set(),
        })),

      setPresentActors: (actors) =>
        set(() => ({ presentActors: new Set(actors) })),

      isActorPresent: (actor) => get().presentActors.has(actor),
    }),
    {
      name: 'skript-present-actors',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        presentActors: Array.from(state.presentActors),
      }),
      merge: (persisted, current) => ({
        ...current,
        presentActors: new Set((persisted as { presentActors?: string[] })?.presentActors || []),
      }),
    }
  )
)

// Utility functions
export function getUniqueActors(scriptData: ScriptRow[]): string[] {
  const actors = new Set<string>()
  scriptData.forEach((row) => {
    if (row.Charakter && row.Szene && parseInt(row.Szene) > 0) {
      actors.add(row.Charakter.trim())
    }
  })
  return Array.from(actors).sort()
}

export function getSceneActors(scriptData: ScriptRow[], scene: string): string[] {
  const actors = new Set<string>()
  scriptData.forEach((row) => {
    if (row.Szene === scene && row.Charakter) {
      actors.add(row.Charakter.trim())
    }
  })
  return Array.from(actors)
}

export function calculateSceneAvailability(
  sceneActors: string[],
  presentActors: Set<string>
): { percentage: number; missingActors: string[]; isPlayable: boolean } {
  if (sceneActors.length === 0) {
    return { percentage: 100, missingActors: [], isPlayable: true }
  }

  const presentCount = sceneActors.filter((actor) => presentActors.has(actor)).length
  const percentage = Math.round((presentCount / sceneActors.length) * 100)
  const missingActors = sceneActors.filter((actor) => !presentActors.has(actor))

  return {
    percentage,
    missingActors,
    isPlayable: missingActors.length === 0,
  }
}
