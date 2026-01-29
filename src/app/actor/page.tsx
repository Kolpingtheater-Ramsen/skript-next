'use client'

import { useEffect, useRef } from 'react'
import { useDirectorStore } from '@/stores/director-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useScriptStore } from '@/stores/script-store'
import { socketManager } from '@/lib/socket'
import { CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Actor View - Simplified view for actors
 * Shows current line with context, auto-scrolls to follow director
 */
export default function ActorPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const { markedLineIndex, setMarkedLineIndex, setIsConnected, setIsReconnecting } =
    useDirectorStore()
  const { playId, selectedActor, useActorNames } = useSettingsStore()
  const { scriptData, actors, loadScript } = useScriptStore()

  // Initialize socket and load script
  useEffect(() => {
    socketManager.init(playId)

    socketManager.on('connect', () => {
      setIsConnected(true)
      setIsReconnecting(false)
    })

    socketManager.on('disconnect', () => {
      setIsConnected(false)
      setIsReconnecting(true)
    })

    socketManager.on('markerUpdate', (data) => {
      setMarkedLineIndex(data.index)
    })

    socketManager.on('markerClear', () => {
      setMarkedLineIndex(null)
    })

    loadScript(playId)

    return () => {
      socketManager.disconnect()
    }
  }, [playId, loadScript, setIsConnected, setIsReconnecting, setMarkedLineIndex])

  // Auto-scroll to marked line
  useEffect(() => {
    if (markedLineIndex !== null) {
      const lineEl = lineRefs.current.get(markedLineIndex)
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [markedLineIndex])

  // Get display name for character
  const getDisplayName = (character: string) => {
    if (!character) return null
    if (useActorNames) {
      const actor = actors.find((a) => a.role === character)
      return actor ? `${character} (${actor.name})` : character
    }
    return character
  }

  // Determine if line is highlighted for selected actor
  const isHighlighted = (row: (typeof scriptData)[0]) => {
    if (!selectedActor) return false
    if (row.Charakter?.toUpperCase() === selectedActor) return true
    if (
      row.Kategorie === CATEGORIES.INSTRUCTION &&
      row['Text/Anweisung']?.toUpperCase().includes(selectedActor)
    ) {
      return true
    }
    return false
  }

  // Only show actor lines and instructions
  const visibleLines = scriptData.filter(
    (row) =>
      row.Kategorie === CATEGORIES.ACTOR ||
      row.Kategorie === CATEGORIES.INSTRUCTION
  )

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Header */}
      <header className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">🎭 Schauspieler-Viewer</h1>
          <div className="text-sm text-[var(--color-text-secondary)]">
            {selectedActor ? (
              <span className="font-medium text-[var(--color-primary)]">
                {selectedActor}
              </span>
            ) : (
              'Alle Rollen'
            )}
          </div>
        </div>
      </header>

      {/* Script content */}
      <main ref={containerRef} className="max-w-2xl mx-auto p-4">
        {visibleLines.map((row, idx) => {
          const originalIndex = scriptData.indexOf(row)
          const isMarked = originalIndex === markedLineIndex
          const isActorHighlighted = isHighlighted(row)
          const isInstruction = row.Kategorie === CATEGORIES.INSTRUCTION

          return (
            <div
              key={originalIndex}
              ref={(el) => {
                if (el) lineRefs.current.set(originalIndex, el)
              }}
              className={cn(
                'p-4 my-2 rounded-lg transition-all',
                isInstruction
                  ? 'italic text-[var(--color-text-secondary)] bg-gray-50 dark:bg-gray-800'
                  : 'bg-[var(--color-surface)]',
                isActorHighlighted &&
                  !isInstruction && [
                    'bg-[var(--color-primary-light)]',
                    'border-l-4 border-l-[var(--color-primary)]',
                  ],
                isMarked && [
                  'bg-[var(--color-success-light)]',
                  '!border-l-4 !border-l-[var(--color-success)]',
                  'shadow-lg',
                ]
              )}
            >
              {/* Character name */}
              {row.Charakter && (
                <div
                  className={cn(
                    'font-semibold mb-1 text-sm',
                    isActorHighlighted
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)]'
                  )}
                >
                  {getDisplayName(row.Charakter)}
                </div>
              )}

              {/* Line text */}
              <div className={cn(isMarked && 'text-lg')}>
                {row['Text/Anweisung']}
              </div>

              {/* Microphone info */}
              {row.Mikrofon && isActorHighlighted && (
                <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                  🎤 Mikrofon {row.Mikrofon}
                </div>
              )}
            </div>
          )
        })}

        {visibleLines.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <div className="text-4xl mb-2">📜</div>
            <div>Kein Skript geladen</div>
          </div>
        )}
      </main>

      {/* Connection status */}
      <div
        className={cn(
          'fixed bottom-4 right-4 w-3 h-3 rounded-full',
          useDirectorStore.getState().isConnected
            ? 'bg-green-500'
            : 'bg-red-500 animate-pulse'
        )}
        title={
          useDirectorStore.getState().isConnected
            ? 'Verbunden'
            : 'Verbindung getrennt'
        }
      />
    </div>
  )
}
