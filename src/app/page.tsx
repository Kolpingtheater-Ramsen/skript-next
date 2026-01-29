'use client'

import { useEffect, useCallback } from 'react'
import { NavBar, Sidebar, BottomNav } from '@/components/layout'
import { ScriptViewer } from '@/components/script'
import { SettingsModal } from '@/components/settings'
import { useScriptStore } from '@/stores/script-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useDirectorStore } from '@/stores/director-store'
import { socketManager } from '@/lib/socket'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const { scriptData, loadScript } = useScriptStore()
  const { playId } = useSettingsStore()
  const director = useDirectorStore()

  // Initialize socket and load script
  useEffect(() => {
    // Initialize socket connection
    socketManager.init(playId)

    // Set up socket event handlers
    socketManager.on('connect', () => {
      director.setIsConnected(true)
      director.setIsReconnecting(false)
    })

    socketManager.on('disconnect', () => {
      director.setIsConnected(false)
      director.setIsReconnecting(true)
    })

    socketManager.on('markerUpdate', (data) => {
      director.setMarkedLineIndex(data.index)
    })

    socketManager.on('markerClear', () => {
      director.setMarkedLineIndex(null)
    })

    socketManager.on('setDirector', (data) => {
      director.setCurrentDirector(data.name)
      // Check if we are the director
      if (data.name === director.credentials.name) {
        director.setIsDirector(true)
        director.setDirectorName(data.name)
      }
    })

    socketManager.on('unsetDirector', () => {
      director.setCurrentDirector(null)
      director.setIsDirector(false)
      director.setDirectorName('')
    })

    socketManager.on('directorTakeover', (data) => {
      director.setCurrentDirector(data.name)
      if (director.isDirector && data.name !== director.directorName) {
        director.setIsDirector(false)
      }
    })

    // Load script data
    loadScript(playId)

    return () => {
      socketManager.disconnect()
    }
  }, [playId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation handlers for director mode
  const handlePreviousLine = useCallback(() => {
    if (!director.isDirector) return

    const currentIndex = director.markedLineIndex ?? 0
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      director.setMarkedLineIndex(newIndex)
      socketManager.setMarker(newIndex)
    }
  }, [director])

  const handleNextLine = useCallback(() => {
    if (!director.isDirector) return

    const currentIndex = director.markedLineIndex ?? -1
    if (currentIndex < scriptData.length - 1) {
      const newIndex = currentIndex + 1
      director.setMarkedLineIndex(newIndex)
      socketManager.setMarker(newIndex)
    }
  }, [director, scriptData.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!director.isDirector) return

      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        handlePreviousLine()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        handleNextLine()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [director.isDirector, handlePreviousLine, handleNextLine])

  return (
    <div
      className={cn(
        'min-h-screen',
        director.isDirector && 'pb-[72px]' // Space for bottom nav
      )}
    >
      <NavBar />
      <Sidebar />
      <SettingsModal />

      <main className="p-4 md:p-2">
        <ScriptViewer />
      </main>

      <BottomNav onPrevious={handlePreviousLine} onNext={handleNextLine} />

      {/* FAB to jump to marked line */}
      {director.markedLineIndex !== null && !director.isDirector && (
        <button
          onClick={() => {
            const el = document.querySelector(
              `[data-line-index="${director.markedLineIndex}"]`
            )
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
          className={cn(
            'fixed right-4 w-14 h-14',
            'flex items-center justify-center',
            'bg-[var(--color-primary)] text-white',
            'border-none rounded-full shadow-lg cursor-pointer',
            'text-xl',
            'hover:bg-[var(--color-primary-hover)] hover:scale-105',
            'transition-all z-[300]',
            director.isDirector ? 'bottom-[88px]' : 'bottom-20'
          )}
          aria-label="Zur markierten Zeile springen"
        >
          📍
        </button>
      )}
    </div>
  )
}
