'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useScriptStore } from '@/stores/script-store'
import { useSettingsStore } from '@/stores/settings-store'
import { CATEGORIES } from '@/lib/constants'

export function TableOfContents() {
  const scriptData = useScriptStore((state) => state.scriptData)
  const selectedActor = useSettingsStore((state) => state.selectedActor)

  // Build scenes list
  const scenes = useMemo(() => {
    const result: Record<string, boolean> = {}

    scriptData.forEach((row) => {
      if (row.Szene) {
        if (!result[row.Szene]) {
          result[row.Szene] = false
        }
        // Check if actor appears in this scene
        if (row.Charakter && row.Charakter === selectedActor) {
          result[row.Szene] = true
        } else if (
          row.Kategorie === CATEGORIES.INSTRUCTION &&
          selectedActor &&
          row['Text/Anweisung'].toUpperCase().includes(selectedActor)
        ) {
          result[row.Szene] = true
        }
      }
    })

    return result
  }, [scriptData, selectedActor])

  const handleClick = (scene: string) => {
    const element = document.getElementById(`scene-${scene}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (Object.keys(scenes).length === 0) return null

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-semibold m-0 mb-3">📖 Inhaltsverzeichnis</h2>
      <div className="flex flex-col gap-1">
        {Object.keys(scenes).map((scene) => {
          const hasActor = scenes[scene]
          return (
            <button
              key={scene}
              onClick={() => handleClick(scene)}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-md',
                'text-[var(--color-text)] text-sm no-underline',
                'border-l-[3px] border-transparent',
                'transition-all cursor-pointer bg-transparent',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                hasActor && [
                  'font-semibold',
                  'bg-[var(--color-primary-light)] dark:bg-[rgba(255,106,0,0.08)]',
                  'text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]',
                  '!border-l-[var(--color-primary)]',
                ]
              )}
            >
              Szene {scene}
            </button>
          )
        })}
      </div>
    </div>
  )
}
