'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NoteEditorProps {
  initialValue: string
  onSave: (value: string) => void
  onCancel: () => void
}

export function NoteEditor({ initialValue, onSave, onCancel }: NoteEditorProps) {
  const [value, setValue] = useState(initialValue)

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSave(value)
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCancel()
  }

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Notiz eingeben..."
        className="w-full min-h-[80px] p-2 text-sm font-sans resize-y rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-light)]"
        autoFocus
      />
      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={handleSave}>
          Speichern
        </Button>
        <Button size="sm" variant="secondary" onClick={handleCancel}>
          Abbrechen
        </Button>
      </div>
    </div>
  )
}
