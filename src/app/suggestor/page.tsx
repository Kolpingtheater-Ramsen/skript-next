'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { useScriptStore } from '@/stores/script-store'
import { useSettingsStore } from '@/stores/settings-store'
import {
  useSuggesterStore,
  getUniqueActors,
  getSceneActors,
  calculateSceneAvailability,
} from '@/stores/suggester-store'
import { cn } from '@/lib/utils'

// Stat card component
function StatCard({
  label,
  value,
  icon,
  subValue,
}: {
  label: string
  value: string | number
  icon: string
  subValue?: string
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 flex flex-col items-center justify-center text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-[var(--color-primary)]">{value}</div>
      <div className="text-sm text-[var(--color-text-secondary)]">{label}</div>
      {subValue && (
        <div className="text-xs text-[var(--color-text-muted)] mt-1">{subValue}</div>
      )}
    </div>
  )
}

// Actor checkbox component
function ActorCheckbox({
  actor,
  isPresent,
  onToggle,
}: {
  actor: string
  isPresent: boolean
  onToggle: () => void
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
        'hover:bg-[var(--color-primary-light)]',
        isPresent
          ? 'bg-green-500/10 border border-green-500/30'
          : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
      )}
    >
      <input
        type="checkbox"
        checked={isPresent}
        onChange={onToggle}
        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
      />
      <span className={cn('text-sm', isPresent ? 'text-green-600 dark:text-green-400' : '')}>
        {actor}
      </span>
    </label>
  )
}

// Scene card component
function SceneCard({
  scene,
  actors,
  presentActors,
}: {
  scene: string
  actors: string[]
  presentActors: Set<string>
}) {
  const availability = calculateSceneAvailability(actors, presentActors)

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] border-2 rounded-lg p-4 transition-all',
        availability.isPlayable
          ? 'border-green-500 shadow-green-500/20 shadow-md'
          : 'border-[var(--color-border)]'
      )}
    >
      {/* Scene header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Szene {scene}</h3>
        <div
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            availability.isPlayable
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : availability.percentage >= 50
                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                : 'bg-red-500/20 text-red-600 dark:text-red-400'
          )}
        >
          {availability.percentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[var(--color-background)] rounded-full h-2 mb-3">
        <div
          className={cn(
            'h-2 rounded-full transition-all',
            availability.isPlayable
              ? 'bg-green-500'
              : availability.percentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
          )}
          style={{ width: `${availability.percentage}%` }}
        />
      </div>

      {/* Actors list */}
      <div className="flex flex-wrap gap-1">
        {actors.map((actor) => {
          const isPresent = presentActors.has(actor)
          return (
            <span
              key={actor}
              className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                isPresent
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
              )}
            >
              {actor}
            </span>
          )
        })}
      </div>

      {/* Missing actors note */}
      {availability.missingActors.length > 0 && (
        <div className="mt-2 text-xs text-[var(--color-text-muted)]">
          Fehlend: {availability.missingActors.join(', ')}
        </div>
      )}
    </div>
  )
}

export default function SuggestorPage() {
  const { scriptData, loadScript, isLoading } = useScriptStore()
  const { playId } = useSettingsStore()
  const { presentActors, toggleActor, toggleAllActors, setPresentActors } = useSuggesterStore()
  const [mounted, setMounted] = useState(false)
  const hasInitialized = useRef(false)

  // Load script on mount
  useEffect(() => {
    if (scriptData.length === 0) {
      loadScript(playId)
    }
    setMounted(true)
  }, [playId, scriptData.length, loadScript])

  // Get all unique actors from script data
  const allActors = useMemo(() => getUniqueActors(scriptData), [scriptData])

  // Initialize present actors on first load if empty
  useEffect(() => {
    if (allActors.length > 0 && presentActors.size === 0 && !hasInitialized.current) {
      hasInitialized.current = true
      setPresentActors(allActors)
    }
  }, [allActors, presentActors.size, setPresentActors])

  // Get unique scenes
  const scenes = useMemo(() => {
    const sceneSet = new Set<string>()
    scriptData.forEach((row) => {
      if (row.Szene && parseInt(row.Szene) > 0) {
        sceneSet.add(row.Szene)
      }
    })
    return Array.from(sceneSet).sort((a, b) => parseInt(a) - parseInt(b))
  }, [scriptData])

  // Get scene data with actors and availability
  const sceneData = useMemo(() => {
    return scenes.map((scene) => {
      const actors = getSceneActors(scriptData, scene)
      const availability = calculateSceneAvailability(actors, presentActors)
      return {
        scene,
        actors,
        ...availability,
      }
    })
  }, [scenes, scriptData, presentActors])

  // Sort scenes by availability (highest percentage first, playable scenes first)
  const sortedSceneData = useMemo(() => {
    return [...sceneData].sort((a, b) => {
      // Playable scenes first
      if (a.isPlayable && !b.isPlayable) return -1
      if (!a.isPlayable && b.isPlayable) return 1
      // Then by percentage
      if (b.percentage !== a.percentage) return b.percentage - a.percentage
      // Then by scene number
      return parseInt(a.scene) - parseInt(b.scene)
    })
  }, [sceneData])

  // Count playable scenes
  const playableScenes = sceneData.filter((s) => s.isPlayable).length

  // Check if all actors are selected
  const allSelected = allActors.length > 0 && allActors.every((actor) => presentActors.has(actor))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Lade Besetzungsvorschlage...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] pb-8">
      {/* Header */}
      <header className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-[var(--color-primary)] hover:underline flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zuruck
          </Link>
          <h1 className="text-lg font-semibold">Besetzungsvorschlage</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {mounted && (
          <>
            {/* Summary Cards */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Ubersicht</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon="🎭"
                  label="Anwesende Schauspieler"
                  value={presentActors.size}
                  subValue={`von ${allActors.length}`}
                />
                <StatCard
                  icon="🎬"
                  label="Spielbare Szenen"
                  value={playableScenes}
                  subValue={`von ${scenes.length}`}
                />
                <StatCard
                  icon="✅"
                  label="Abdeckung"
                  value={`${scenes.length > 0 ? Math.round((playableScenes / scenes.length) * 100) : 0}%`}
                />
                <StatCard
                  icon="❌"
                  label="Fehlende Szenen"
                  value={scenes.length - playableScenes}
                />
              </div>
            </section>

            {/* Actor Selection */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Anwesenheit</h2>
                <button
                  onClick={() => toggleAllActors(allActors, !allSelected)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    'bg-[var(--color-primary)] text-white',
                    'hover:bg-[var(--color-primary-hover)]'
                  )}
                >
                  {allSelected ? 'Alle Abwahlen' : 'Alle Auswahlen'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {allActors.map((actor) => (
                  <ActorCheckbox
                    key={actor}
                    actor={actor}
                    isPresent={presentActors.has(actor)}
                    onToggle={() => toggleActor(actor)}
                  />
                ))}
              </div>
            </section>

            {/* Scene Availability */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Szenen-Verfugbarkeit</h2>
              {sortedSceneData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedSceneData.map(({ scene, actors }) => (
                    <SceneCard
                      key={scene}
                      scene={scene}
                      actors={actors}
                      presentActors={presentActors}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                  <div className="text-4xl mb-2">🎬</div>
                  <div>Keine Szenen verfugbar</div>
                </div>
              )}
            </section>
          </>
        )}

        {!mounted && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4" />
            <div>Lade...</div>
          </div>
        )}

        {mounted && allActors.length === 0 && !isLoading && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <div className="text-4xl mb-2">🎭</div>
            <div>Keine Schauspieler gefunden</div>
          </div>
        )}
      </main>
    </div>
  )
}
