'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Theme, FilterSettings, Settings } from '@/types'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/lib/constants'

interface SettingsState extends Settings {
  // Hydration state
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  // Theme
  setTheme: (theme: Theme) => void
  // Selection
  setSelectedActor: (actor: string) => void
  setPlayId: (id: string) => void
  // Filters
  toggleFilter: (key: keyof FilterSettings) => void
  setContextLines: (key: string, value: number) => void
  // Display
  setShowSceneOverview: (show: boolean) => void
  setUseActorNames: (use: boolean) => void
  setEnableNotes: (enable: boolean) => void
  setBlurLines: (blur: boolean) => void
  setAutoScroll: (scroll: boolean) => void
  // Batch update
  updateSettings: (settings: Partial<Settings>) => void
  // Reset
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setTheme: (theme) => set({ theme }),

      setSelectedActor: (selectedActor) => set({ selectedActor }),

      setPlayId: (playId) => set({ playId }),

      toggleFilter: (key) =>
        set((state) => ({
          [key]: !state[key],
        })),

      setContextLines: (key, value) =>
        set({
          [key]: value,
        }),

      setShowSceneOverview: (showSceneOverview) => set({ showSceneOverview }),

      setUseActorNames: (useActorNames) => set({ useActorNames }),

      setEnableNotes: (enableNotes) => set({ enableNotes }),

      setBlurLines: (blurLines) => set({ blurLines }),

      setAutoScroll: (autoScroll) => set({ autoScroll }),

      updateSettings: (settings) => set(settings),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        theme: state.theme,
        playId: state.playId,
        selectedActor: state.selectedActor,
        showActorText: state.showActorText,
        showDirections: state.showDirections,
        showTechnical: state.showTechnical,
        showLighting: state.showLighting,
        showEinspieler: state.showEinspieler,
        showRequisiten: state.showRequisiten,
        showMikrofonCues: state.showMikrofonCues,
        showMicro: state.showMicro,
        showSceneOverview: state.showSceneOverview,
        useActorNames: state.useActorNames,
        enableNotes: state.enableNotes,
        blurLines: state.blurLines,
        autoScroll: state.autoScroll,
        directionsContext: state.directionsContext,
        technicalContext: state.technicalContext,
        lightingContext: state.lightingContext,
        einspielContext: state.einspielContext,
        requisitenContext: state.requisitenContext,
        mikrofonContext: state.mikrofonContext,
      }),
    }
  )
)
