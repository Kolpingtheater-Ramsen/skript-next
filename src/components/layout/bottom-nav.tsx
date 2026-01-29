'use client'

import { useMemo, useCallback, useEffect, useState } from 'react'
import { useDirectorStore } from '@/stores/director-store'
import { useScriptStore } from '@/stores/script-store'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import type { ScriptRow } from '@/types'

interface BottomNavProps {
  onPrevious: () => void
  onNext: () => void
}

// Check if a line is highlighted for the selected actor
function isLineHighlightedForActor(row: ScriptRow, selectedActor: string): boolean {
  if (!selectedActor) return false

  // Check if character matches
  if (row.Charakter?.toUpperCase() === selectedActor) return true

  // Check if instruction mentions the actor
  if (
    row.Kategorie === CATEGORIES.INSTRUCTION &&
    row['Text/Anweisung']?.toUpperCase().includes(selectedActor)
  ) {
    return true
  }

  return false
}

export function BottomNav({ onPrevious, onNext }: BottomNavProps) {
  const isDirector = useDirectorStore((state) => state.isDirector)
  const markedLineIndex = useDirectorStore((state) => state.markedLineIndex)
  const scriptData = useScriptStore((state) => state.scriptData)
  const selectedActor = useSettingsStore((state) => state.selectedActor)

  // Track current actor line index for navigation
  const [currentActorLinePosition, setCurrentActorLinePosition] = useState(0)

  // Get list of highlighted line indices for the selected actor
  const highlightedLineIndices = useMemo(() => {
    if (!selectedActor) return []

    const indices: number[] = []
    scriptData.forEach((row, index) => {
      if (isLineHighlightedForActor(row, selectedActor)) {
        indices.push(index)
      }
    })
    return indices
  }, [scriptData, selectedActor])

  // Reset position when actor changes
  useEffect(() => {
    setCurrentActorLinePosition(0)
  }, [selectedActor])

  // Handle navigation to previous actor line
  const handleActorPrevious = useCallback(() => {
    if (highlightedLineIndices.length === 0) return

    const newPosition = currentActorLinePosition > 0
      ? currentActorLinePosition - 1
      : highlightedLineIndices.length - 1 // Wrap to end

    setCurrentActorLinePosition(newPosition)

    // Scroll to the line
    const lineIndex = highlightedLineIndices[newPosition]
    const el = document.querySelector(`[data-line-index="${lineIndex}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedLineIndices, currentActorLinePosition])

  // Handle navigation to next actor line
  const handleActorNext = useCallback(() => {
    if (highlightedLineIndices.length === 0) return

    const newPosition = currentActorLinePosition < highlightedLineIndices.length - 1
      ? currentActorLinePosition + 1
      : 0 // Wrap to beginning

    setCurrentActorLinePosition(newPosition)

    // Scroll to the line
    const lineIndex = highlightedLineIndices[newPosition]
    const el = document.querySelector(`[data-line-index="${lineIndex}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedLineIndices, currentActorLinePosition])

  // Director mode bottom nav
  if (isDirector) {
    const totalLines = scriptData.length
    const currentLine = markedLineIndex !== null ? markedLineIndex + 1 : 0

    return (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0',
          'flex items-center justify-between',
          'px-4 py-3',
          'bg-[var(--color-surface)] dark:bg-[rgba(24,24,26,0.9)]',
          'border-t border-[var(--color-border)]',
          'z-[300]',
          'dark:backdrop-blur-lg'
        )}
      >
        <Button variant="secondary" onClick={onPrevious} aria-label="Vorherige Zeile">
          ← Zurück
        </Button>
        <span className="text-sm text-[var(--color-text-secondary)] font-medium">
          {currentLine > 0 ? `${currentLine} / ${totalLines}` : '—'}
        </span>
        <Button variant="secondary" onClick={onNext} aria-label="Nächste Zeile">
          Weiter →
        </Button>
      </div>
    )
  }

  // Actor navigation mode - show when an actor is selected
  if (selectedActor && highlightedLineIndices.length > 0) {
    const currentLineDisplay = currentActorLinePosition + 1
    const totalActorLines = highlightedLineIndices.length

    return (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0',
          'flex items-center justify-between',
          'px-4 py-3',
          'bg-[var(--color-surface)] dark:bg-[rgba(24,24,26,0.9)]',
          'border-t border-[var(--color-border)]',
          'z-[300]',
          'dark:backdrop-blur-lg'
        )}
      >
        <Button variant="secondary" onClick={handleActorPrevious} aria-label="Vorheriger Text">
          ← Zurück
        </Button>
        <span className="text-sm text-[var(--color-text-secondary)] font-medium">
          Text {currentLineDisplay} von {totalActorLines}
        </span>
        <Button variant="secondary" onClick={handleActorNext} aria-label="Nächster Text">
          Weiter →
        </Button>
      </div>
    )
  }

  // No nav shown if not director and no actor selected
  return null
}
