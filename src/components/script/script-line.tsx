'use client'

import { useState, useMemo } from 'react'
import { cn, escapeRegExp, getLineId } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { useSettingsStore } from '@/stores/settings-store'
import { useNotesStore } from '@/stores/notes-store'
import { useScriptStore } from '@/stores/script-store'
import type { ScriptRow } from '@/types'
import { Tag } from './tag'
import { NoteEditor } from './note-editor'

interface ScriptLineProps {
  row: ScriptRow
  index: number
  isMarked: boolean
  isContext: boolean
  onClick: () => void
}

export function ScriptLine({
  row,
  index,
  isMarked,
  isContext,
  onClick,
}: ScriptLineProps) {
  const [isEditingNote, setIsEditingNote] = useState(false)

  // Use individual selectors for proper reactivity after hydration
  const selectedActor = useSettingsStore((state) => state.selectedActor)
  const useActorNames = useSettingsStore((state) => state.useActorNames)
  const showMicro = useSettingsStore((state) => state.showMicro)
  const enableNotes = useSettingsStore((state) => state.enableNotes)
  const blurLines = useSettingsStore((state) => state.blurLines)
  const actors = useScriptStore((state) => state.actors)
  const { getNote, setNote, deleteNote } = useNotesStore()

  const lineId = useMemo(
    () =>
      getLineId(
        row.Szene || '',
        row.Charakter || '',
        index,
        (row['Text/Anweisung'] || '').length
      ),
    [row, index]
  )

  const note = getNote(lineId)

  // Determine line type
  const isInstruction = row.Kategorie === CATEGORIES.INSTRUCTION
  const isTechnical = row.Kategorie === CATEGORIES.TECHNICAL
  const isLighting = row.Kategorie === CATEGORIES.LIGHTING
  const isAudio = row.Kategorie === CATEGORIES.AUDIO
  const isProps = row.Kategorie === CATEGORIES.PROPS
  const isMicrophone = row.Kategorie === CATEGORIES.MICROPHONE
  const isSceneStart = row.Kategorie === CATEGORIES.SCENE_START

  // Check if this actor is selected
  const isHighlighted = useMemo(() => {
    if (!selectedActor) return false
    if (row.Charakter?.toUpperCase() === selectedActor) return true
    if (
      isInstruction &&
      row['Text/Anweisung']?.toUpperCase().includes(selectedActor)
    ) {
      return true
    }
    return false
  }, [selectedActor, row, isInstruction])

  // Don't render scene start lines
  if (isSceneStart) return null

  // Get display name
  const getDisplayName = () => {
    if (!row.Charakter) return null
    if (useActorNames) {
      const actor = actors.find((a) => a.role === row.Charakter)
      return actor ? `${row.Charakter} (${actor.name})` : row.Charakter
    }
    return row.Charakter
  }

  // Get display text with actor name substitution
  const getDisplayText = () => {
    let text = row['Text/Anweisung'] || ''
    if (useActorNames && actors.length > 0) {
      actors.forEach(({ role, name }) => {
        try {
          const pattern = new RegExp(`\\b${escapeRegExp(role)}\\b`, 'gi')
          text = text.replace(pattern, `${role} (${name})`)
        } catch {
          // Skip problematic patterns
        }
      })
    }
    return text
  }

  const displayName = getDisplayName()
  const displayText = getDisplayText()

  // Bold selected actor in instructions
  const renderText = () => {
    if (isInstruction && selectedActor) {
      const nameToBold = useActorNames
        ? actors.find((a) => a.role === selectedActor)?.name ||
          selectedActor
        : selectedActor
      try {
        const parts = displayText.split(new RegExp(`(${escapeRegExp(nameToBold)})`, 'gi'))
        return parts.map((part, i) =>
          part.toLowerCase() === nameToBold.toLowerCase() ? (
            <strong key={i}>{part}</strong>
          ) : (
            part
          )
        )
      } catch {
        return displayText
      }
    }
    return displayText
  }

  return (
    <div
      className={cn(
        'group relative p-3 px-4 my-2 rounded-lg cursor-pointer',
        'border border-transparent transition-all',
        'bg-[var(--color-surface)]',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        // Category backgrounds
        isInstruction && 'bg-instruction-bg italic text-gray-600 dark:text-gray-400',
        isTechnical && 'bg-technical-bg',
        isLighting && 'bg-lighting-bg',
        isAudio && 'bg-audio-bg',
        isProps && 'bg-props-bg',
        isMicrophone && 'bg-microphone-bg',
        row.isAutoMic && 'border-l-[3px] border-l-dashed border-l-microphone opacity-90',
        // Highlighted (selected actor)
        isHighlighted && !isInstruction && [
          'bg-[var(--color-primary-light)]',
          'border-l-4 border-l-[var(--color-primary)]',
          'pl-[calc(1rem-4px)]',
        ],
        // Marked line (director mode)
        isMarked && [
          '!border-l-4 !border-l-[var(--color-success)]',
          'bg-[var(--color-success-light)]',
          'pl-[calc(1rem-4px)]',
        ],
        // Context line
        isContext && 'opacity-60',
        // Blur for practice mode
        isHighlighted && blurLines && 'blur-[4px]'
      )}
      onClick={onClick}
    >
      {/* Tag */}
      {isInstruction && <Tag type="instruction">📝 Anweisung</Tag>}
      {isTechnical && <Tag type="technical">🛠️ Technik</Tag>}
      {isLighting && <Tag type="lighting">💡 Licht</Tag>}
      {isAudio && <Tag type="audio">🔊 Einspieler</Tag>}
      {isProps && <Tag type="props">📦 Requisiten</Tag>}
      {isMicrophone && (
        <Tag
          type="microphone"
          className={cn(
            row.isAutoMic && row.micCueType === 'EIN' && 'bg-green-500',
            row.isAutoMic && row.micCueType === 'AUS' && 'bg-red-500'
          )}
        >
          🎤 {row.isAutoMic && row.micCueType ? row.micCueType : 'Mikrofon'}
        </Tag>
      )}

      {/* Character name */}
      {displayName && (
        <div className="inline-block font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-primary)] mb-1 text-sm">
          {showMicro && row.Mikrofon
            ? `${displayName} (${row.Mikrofon})`
            : displayName}
        </div>
      )}

      {/* Text content */}
      <div>{renderText()}</div>

      {/* Note */}
      {enableNotes && (
        <>
          {note && !isEditingNote && (
            <div className="mt-3 p-3 bg-[rgba(251,191,36,0.15)] dark:bg-[rgba(245,158,11,0.08)] border-l-[3px] border-l-warning rounded-md text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-warning text-xs uppercase tracking-wider">
                  📝 Notiz
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditingNote(true)
                    }}
                    className="p-1 bg-transparent border-none cursor-pointer text-sm opacity-70 hover:opacity-100 rounded"
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Notiz wirklich löschen?')) {
                        deleteNote(lineId)
                      }
                    }}
                    className="p-1 bg-transparent border-none cursor-pointer text-sm opacity-70 hover:opacity-100 rounded"
                    title="Löschen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="whitespace-pre-wrap">{note}</div>
            </div>
          )}

          {isEditingNote && (
            <NoteEditor
              initialValue={note || ''}
              onSave={(value) => {
                setNote(lineId, value)
                setIsEditingNote(false)
              }}
              onCancel={() => setIsEditingNote(false)}
            />
          )}

          {/* Add note button */}
          {!note && !isEditingNote && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditingNote(true)
              }}
              className={cn(
                'absolute top-2 right-2 px-2 py-1',
                'bg-warning text-white border-none rounded-sm',
                'text-xs cursor-pointer',
                'opacity-0 group-hover:opacity-100 transition-opacity'
              )}
              title="Notiz hinzufügen"
            >
              ✏️
            </button>
          )}
        </>
      )}
    </div>
  )
}
