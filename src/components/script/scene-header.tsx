'use client'

import { cn } from '@/lib/utils'

interface SceneHeaderProps {
  scene: string
  summary?: string
}

export function SceneHeader({ scene, summary }: SceneHeaderProps) {
  return (
    <>
      <a id={`scene-${scene}`} className="block" />
      <h2 className="text-2xl font-semibold mt-8 mb-4">🎬 Szene {scene}</h2>
      {summary && (
        <div
          className={cn(
            'text-sm text-[var(--color-text-secondary)] italic',
            'my-2 mb-4 p-2 px-3',
            'bg-gray-50 dark:bg-gray-800 rounded-md',
            'border-l-[3px] border-l-gray-300 dark:border-l-gray-600'
          )}
        >
          {summary}
        </div>
      )}
      <div className="border-t-2 border-t-[var(--color-primary)] mb-4" />
    </>
  )
}
