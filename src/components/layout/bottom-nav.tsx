'use client'

import { useDirectorStore } from '@/stores/director-store'
import { useScriptStore } from '@/stores/script-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  onPrevious: () => void
  onNext: () => void
}

export function BottomNav({ onPrevious, onNext }: BottomNavProps) {
  const isDirector = useDirectorStore((state) => state.isDirector)
  const markedLineIndex = useDirectorStore((state) => state.markedLineIndex)
  const scriptData = useScriptStore((state) => state.scriptData)

  // Only show when director mode is active
  if (!isDirector) return null

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
