'use client'

import { useEffect, ReactNode } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useDirectorStore } from '@/stores/director-store'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useSettingsStore((state) => state.theme)
  const isDirector = useDirectorStore((state) => state.isDirector)
  const isReconnecting = useDirectorStore((state) => state.isReconnecting)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'pink')
    body.classList.remove('light', 'dark', 'pink')

    // Add current theme class
    root.classList.add(theme)
    body.classList.add(theme)

    // Director mode class
    if (isDirector) {
      body.classList.add('is-director')
    } else {
      body.classList.remove('is-director')
    }

    // Reconnecting state
    if (isReconnecting) {
      body.classList.add('reconnecting')
    } else {
      body.classList.remove('reconnecting')
    }
  }, [theme, isDirector, isReconnecting])

  return <>{children}</>
}
