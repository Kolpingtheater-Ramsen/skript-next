'use client'

import { useUIStore } from '@/stores/ui-store'
import { useScriptStore } from '@/stores/script-store'
import { useSettingsStore } from '@/stores/settings-store'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const scriptData = useScriptStore((state) => state.scriptData)
  const selectedActor = useSettingsStore((state) => state.selectedActor)

  // Build scenes list
  const scenes: Record<string, boolean> = {}
  scriptData.forEach((row) => {
    if (row.Szene) {
      if (!scenes[row.Szene]) {
        scenes[row.Szene] = false
      }
      // Check if actor appears in this scene
      if (row.Charakter && row.Charakter === selectedActor) {
        scenes[row.Szene] = true
      } else if (
        row.Kategorie === CATEGORIES.INSTRUCTION &&
        selectedActor &&
        row['Text/Anweisung'].toUpperCase().includes(selectedActor)
      ) {
        scenes[row.Szene] = true
      }
    }
  })

  const handleSceneClick = (scene: string) => {
    const element = document.getElementById(`scene-${scene}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-xs z-[400]',
          sidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 w-[300px] h-screen',
          'bg-[var(--color-surface)] dark:bg-[rgba(24,24,26,0.95)]',
          'border-l border-[var(--color-border)]',
          'z-[500] overflow-y-auto p-6',
          'transition-[right] duration-300',
          'dark:backdrop-blur-xl',
          sidebarOpen ? 'right-0' : '-right-[320px]'
        )}
        role="navigation"
        aria-label="Inhaltsverzeichnis"
      >
        <h2 className="text-lg font-semibold mb-4 mt-0">
          📖 Inhaltsverzeichnis
        </h2>

        <div className="flex flex-col gap-1">
          {Object.keys(scenes).map((scene) => {
            const hasActor = scenes[scene]
            return (
              <button
                key={scene}
                onClick={() => handleSceneClick(scene)}
                className={cn(
                  'block w-full text-left px-3 py-2 mb-1 rounded-md',
                  'text-[var(--color-text)] text-sm no-underline',
                  'border-l-[3px] border-transparent',
                  'transition-all cursor-pointer bg-transparent',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  hasActor && [
                    'font-semibold',
                    'bg-[var(--color-primary-light)] dark:bg-[rgba(255,106,0,0.08)]',
                    'text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]',
                    'border-l-[var(--color-primary)]',
                  ]
                )}
              >
                Szene {scene}
              </button>
            )
          })}
        </div>
      </aside>
    </>
  )
}
