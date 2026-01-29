'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings-store'
import { useScriptStore } from '@/stores/script-store'
import type { ScriptRow } from '@/types'

interface SceneOverviewProps {
  sceneData: ScriptRow[]
}

export function SceneOverview({ sceneData }: SceneOverviewProps) {
  const settings = useSettingsStore()
  const actors = useScriptStore((state) => state.actors)

  const actorList = useMemo(() => {
    const actorsSet = new Set<string>()
    const micros = new Map<string, string>()

    sceneData.forEach((row) => {
      if (row.Charakter) {
        let display: string
        if (settings.useActorNames) {
          const actor = actors.find((a) => a.role === row.Charakter)
          display = actor
            ? `${row.Charakter} (${actor.name})`
            : row.Charakter
        } else {
          display = row.Charakter
        }
        actorsSet.add(display)
        if (row.Mikrofon) {
          micros.set(display, row.Mikrofon)
        }
      }
    })

    // Sort by microphone number
    return Array.from(actorsSet).sort((a, b) => {
      const microA = parseInt(micros.get(a) || '999', 10)
      const microB = parseInt(micros.get(b) || '999', 10)
      return microA - microB
    }).map((actor) => ({
      actor,
      micro: micros.get(actor) || '',
    }))
  }, [sceneData, settings.useActorNames, actors])

  if (actorList.length === 0) return null

  return (
    <div
      className={cn(
        'bg-[var(--color-primary-light)] dark:bg-[rgba(255,106,0,0.08)]',
        'p-4 rounded-lg mb-6',
        'border border-[rgba(255,106,0,0.2)]'
      )}
    >
      <h3 className="m-0 mb-3 text-base font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]">
        📊 Szenenübersicht
      </h3>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 px-3 text-sm font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-primary)] border-b border-[rgba(255,106,0,0.3)]">
              Mikro
            </th>
            <th className="text-left p-2 px-3 text-sm font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-primary)] border-b border-[rgba(255,106,0,0.3)]">
              Schauspieler
            </th>
          </tr>
        </thead>
        <tbody>
          {actorList.map(({ actor, micro }) => {
            // Check if this is the selected actor
            const roleName = actor.split('(')[0].trim().toUpperCase()
            const isSelected =
              settings.selectedActor && roleName === settings.selectedActor

            return (
              <tr key={actor}>
                <td className="text-left p-2 px-3 text-sm border-b border-[rgba(255,106,0,0.1)] last:border-b-0">
                  {micro}
                </td>
                <td className="text-left p-2 px-3 text-sm border-b border-[rgba(255,106,0,0.1)] last:border-b-0">
                  {isSelected ? <strong>{actor}</strong> : actor}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
