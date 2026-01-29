# Skript-Next Feature Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Achieve feature parity between skript-next.logge.top and the legacy skript.logge.top application.

**Architecture:** The Next.js app uses Zustand stores for state, Tailwind CSS for styling, and connects to a Flask backend via Socket.IO for real-time features. New pages follow the existing pattern: page.tsx files in src/app/, reusable components in src/components/, and business logic in stores/lib.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand 5, Socket.IO Client 4.8, Tailwind CSS 3.4, ApexCharts (for stats)

---

## Phase 1: Statistics Page

### Task 1.1: Install ApexCharts

**Files:**
- Modify: `/home/fedora/projects/skript-next/package.json`

**Step 1: Install dependency**

Run:
```bash
cd /home/fedora/projects/skript-next && npm install apexcharts react-apexcharts
```

**Step 2: Verify installation**

Run:
```bash
grep apexcharts /home/fedora/projects/skript-next/package.json
```
Expected: Shows apexcharts in dependencies

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add package.json package-lock.json && git commit -m "feat: add apexcharts for statistics charts"
```

---

### Task 1.2: Create Stats Types

**Files:**
- Modify: `/home/fedora/projects/skript-next/src/types/index.ts`

**Step 1: Add stats types to types/index.ts**

Add at the end of the file:

```typescript
// Stats types
export interface ActorStats {
  name: string
  occurrences: number
  words: number
  percent: string
}

export interface ScriptStats {
  actors: ActorStats[]
  totalActors: number
  totalWords: number
  totalScenes: number
  avgWords: number
}
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/types/index.ts && git commit -m "feat(types): add stats types for statistics page"
```

---

### Task 1.3: Create Stats Calculation Utility

**Files:**
- Create: `/home/fedora/projects/skript-next/src/lib/stats.ts`

**Step 1: Create stats.ts**

```typescript
import type { ScriptRow, ScriptStats, ActorStats } from '@/types'

const BLACKLIST = ['OFFTEXT', 'ALLE', 'LIED', '[LIED]', 'CHOR']
const ACTOR_CATEGORIES = ['Schauspieltext', 'Schauspieler']

export function calculateStats(data: ScriptRow[]): ScriptStats {
  const actors: Record<string, { occurrences: number; words: number }> = {}
  const scenes = new Set<string>()

  data.forEach((row) => {
    if (row.Szene) {
      scenes.add(row.Szene)
    }

    if (!ACTOR_CATEGORIES.includes(row.Kategorie)) return

    let actor = row.Charakter
    if (!actor) return

    // Clean actor name
    actor = actor.replace(/\(.*\)/, '').trim().toUpperCase()
    if (BLACKLIST.includes(actor) || !actor) return

    const text = row['Text/Anweisung'] || ''
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length

    if (!actors[actor]) {
      actors[actor] = { occurrences: 0, words: 0 }
    }

    actors[actor].occurrences++
    actors[actor].words += words
  })

  const totalWords = Object.values(actors).reduce((sum, a) => sum + a.words, 0)

  const actorArray: ActorStats[] = Object.entries(actors)
    .map(([name, stats]) => ({
      name,
      occurrences: stats.occurrences,
      words: stats.words,
      percent: totalWords > 0 ? ((stats.words / totalWords) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.words - a.words)

  return {
    actors: actorArray,
    totalActors: actorArray.length,
    totalWords,
    totalScenes: scenes.size,
    avgWords: actorArray.length > 0 ? Math.round(totalWords / actorArray.length) : 0,
  }
}
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/lib/stats.ts && git commit -m "feat(lib): add stats calculation utility"
```

---

### Task 1.4: Create Stats Page

**Files:**
- Create: `/home/fedora/projects/skript-next/src/app/stats/page.tsx`

**Step 1: Create stats page**

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useScriptStore, useSettingsStore } from '@/stores'
import { calculateStats } from '@/lib/stats'
import type { ScriptStats } from '@/types'

// Dynamic import for ApexCharts (SSR disabled)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function StatsPage() {
  const { scriptData, loadScript } = useScriptStore()
  const { playId, theme } = useSettingsStore()
  const [stats, setStats] = useState<ScriptStats | null>(null)

  useEffect(() => {
    if (scriptData.length === 0) {
      loadScript(playId)
    }
  }, [playId, scriptData.length, loadScript])

  useEffect(() => {
    if (scriptData.length > 0) {
      setStats(calculateStats(scriptData))
    }
  }, [scriptData])

  const isDark = theme === 'dark' || theme === 'pink'
  const chartTheme = {
    mode: isDark ? 'dark' : 'light',
    foreColor: isDark ? '#e5e7eb' : '#374151',
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">Lade Statistiken...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <img src="/logo.png" alt="Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-text">📊 Statistiken</h1>
          <Link
            href="/"
            className="ml-auto text-primary font-semibold hover:underline"
          >
            ← Zurück zum Drehbuch
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Rollen" value={stats.totalActors} />
          <StatCard label="Gesprochene Wörter" value={stats.totalWords.toLocaleString('de-DE')} />
          <StatCard label="Szenen" value={stats.totalScenes} />
          <StatCard label="Ø Wörter pro Rolle" value={stats.avgWords.toLocaleString('de-DE')} />
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">📋 Rollen-Übersicht</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-text-secondary border-b border-border">
                <th className="p-3">Rolle</th>
                <th className="p-3">Auftritte</th>
                <th className="p-3">Wörter</th>
                <th className="p-3">Anteil (%)</th>
              </tr>
            </thead>
            <tbody>
              {stats.actors.map((actor) => (
                <tr key={actor.name} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3 font-semibold">{actor.name}</td>
                  <td className="p-3">{actor.occurrences}</td>
                  <td className="p-3">{actor.words.toLocaleString('de-DE')}</td>
                  <td className="p-3">{actor.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Donut Chart */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">📊 Wortanteil pro Rolle</h3>
          <Chart
            type="donut"
            height={400}
            series={stats.actors.map((a) => a.words)}
            options={{
              labels: stats.actors.map((a) => a.name),
              theme: { mode: chartTheme.mode as 'light' | 'dark' },
              chart: { foreColor: chartTheme.foreColor, background: 'transparent' },
              legend: { position: 'bottom' },
            }}
          />
        </div>

        {/* Horizontal Bar Chart - Occurrences */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">📈 Auftritte pro Rolle</h3>
          <Chart
            type="bar"
            height={400}
            series={[{ name: 'Auftritte', data: stats.actors.map((a) => a.occurrences) }]}
            options={{
              plotOptions: { bar: { horizontal: true, barHeight: '70%' } },
              xaxis: { categories: stats.actors.map((a) => a.name) },
              theme: { mode: chartTheme.mode as 'light' | 'dark' },
              chart: { foreColor: chartTheme.foreColor, background: 'transparent' },
              dataLabels: { enabled: true },
            }}
          />
        </div>

        {/* Vertical Bar Chart - Words */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">📉 Wörter pro Rolle</h3>
          <Chart
            type="bar"
            height={400}
            series={[{ name: 'Wörter', data: stats.actors.map((a) => a.words) }]}
            options={{
              plotOptions: { bar: { horizontal: false, columnWidth: '70%' } },
              xaxis: { categories: stats.actors.map((a) => a.name), labels: { rotate: -45 } },
              theme: { mode: chartTheme.mode as 'light' | 'dark' },
              chart: { foreColor: chartTheme.foreColor, background: 'transparent' },
              dataLabels: { enabled: false },
            }}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-sm text-text-secondary mb-1">{label}</div>
      <div className="text-2xl font-bold text-text">{value}</div>
    </div>
  )
}
```

**Step 2: Test by running dev server**

Run:
```bash
cd /home/fedora/projects/skript-next && npm run dev &
sleep 5 && curl -s http://localhost:3000/stats | head -20
```
Expected: HTML response (may show loading state)

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/app/stats/page.tsx && git commit -m "feat(stats): add statistics page with charts and table"
```

---

## Phase 2: Casting Suggester Page

### Task 2.1: Create Suggester Store

**Files:**
- Create: `/home/fedora/projects/skript-next/src/stores/suggester-store.ts`
- Modify: `/home/fedora/projects/skript-next/src/stores/index.ts`

**Step 1: Create suggester-store.ts**

```typescript
'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ScriptRow } from '@/types'

interface SuggesterState {
  presentActors: Set<string>
  toggleActor: (actor: string) => void
  toggleAllActors: (actors: string[], selectAll: boolean) => void
  setPresentActors: (actors: string[]) => void
  isActorPresent: (actor: string) => boolean
}

export const useSuggesterStore = create<SuggesterState>()(
  persist(
    (set, get) => ({
      presentActors: new Set<string>(),

      toggleActor: (actor) =>
        set((state) => {
          const newSet = new Set(state.presentActors)
          if (newSet.has(actor)) {
            newSet.delete(actor)
          } else {
            newSet.add(actor)
          }
          return { presentActors: newSet }
        }),

      toggleAllActors: (actors, selectAll) =>
        set(() => ({
          presentActors: selectAll ? new Set(actors) : new Set(),
        })),

      setPresentActors: (actors) =>
        set(() => ({ presentActors: new Set(actors) })),

      isActorPresent: (actor) => get().presentActors.has(actor),
    }),
    {
      name: 'skript-present-actors',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        presentActors: Array.from(state.presentActors),
      }),
      merge: (persisted, current) => ({
        ...current,
        presentActors: new Set((persisted as { presentActors?: string[] })?.presentActors || []),
      }),
    }
  )
)

// Utility functions
export function getUniqueActors(scriptData: ScriptRow[]): string[] {
  const actors = new Set<string>()
  scriptData.forEach((row) => {
    if (row.Charakter && row.Szene && parseInt(row.Szene) > 0) {
      actors.add(row.Charakter.trim())
    }
  })
  return Array.from(actors).sort()
}

export function getSceneActors(scriptData: ScriptRow[], scene: string): string[] {
  const actors = new Set<string>()
  scriptData.forEach((row) => {
    if (row.Szene === scene && row.Charakter) {
      actors.add(row.Charakter.trim())
    }
  })
  return Array.from(actors)
}

export function calculateSceneAvailability(
  sceneActors: string[],
  presentActors: Set<string>
): { percentage: number; missingActors: string[]; isPlayable: boolean } {
  if (sceneActors.length === 0) {
    return { percentage: 100, missingActors: [], isPlayable: true }
  }

  const presentCount = sceneActors.filter((actor) => presentActors.has(actor)).length
  const percentage = Math.round((presentCount / sceneActors.length) * 100)
  const missingActors = sceneActors.filter((actor) => !presentActors.has(actor))

  return {
    percentage,
    missingActors,
    isPlayable: missingActors.length === 0,
  }
}
```

**Step 2: Update stores/index.ts**

Add export:
```typescript
export { useSuggesterStore, getUniqueActors, getSceneActors, calculateSceneAvailability } from './suggester-store'
```

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/stores/suggester-store.ts src/stores/index.ts && git commit -m "feat(store): add suggester store for actor attendance tracking"
```

---

### Task 2.2: Create Suggester Page

**Files:**
- Create: `/home/fedora/projects/skript-next/src/app/suggestor/page.tsx`

**Step 1: Create suggestor page**

```typescript
'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useScriptStore, useSettingsStore } from '@/stores'
import {
  useSuggesterStore,
  getUniqueActors,
  getSceneActors,
  calculateSceneAvailability,
} from '@/stores/suggester-store'
import { Checkbox } from '@/components/ui'

export default function SuggestorPage() {
  const { scriptData, loadScript } = useScriptStore()
  const { playId } = useSettingsStore()
  const { presentActors, toggleActor, toggleAllActors, setPresentActors } = useSuggesterStore()

  // Load script if needed
  useEffect(() => {
    if (scriptData.length === 0) {
      loadScript(playId)
    }
  }, [playId, scriptData.length, loadScript])

  // Get unique actors
  const allActors = useMemo(() => getUniqueActors(scriptData), [scriptData])

  // Initialize present actors on first load
  useEffect(() => {
    if (allActors.length > 0 && presentActors.size === 0) {
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

  // Calculate scene data
  const sceneData = useMemo(() => {
    return scenes.map((scene) => {
      const actors = getSceneActors(scriptData, scene)
      const availability = calculateSceneAvailability(actors, presentActors)
      return { scene, actors, ...availability }
    }).sort((a, b) => b.percentage - a.percentage)
  }, [scenes, scriptData, presentActors])

  const playableCount = sceneData.filter((s) => s.isPlayable).length
  const allSelected = presentActors.size === allActors.length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <h1 className="text-2xl font-bold text-text">🎲 Rollenvorschläge</h1>
          <Link
            href="/"
            className="ml-auto text-primary font-semibold hover:underline"
          >
            ← Zurück zum Drehbuch
          </Link>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-sm text-text-secondary">Anwesende Schauspieler</div>
            <div className="text-2xl font-bold text-text">{presentActors.size}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-sm text-text-secondary">Spielbare Szenen</div>
            <div className="text-2xl font-bold text-text">
              {playableCount} von {scenes.length}
            </div>
          </div>
        </div>

        {/* Actor List */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">👥 Anwesende Schauspieler</h3>
            <button
              onClick={() => toggleAllActors(allActors, !allSelected)}
              className="text-sm text-primary font-semibold hover:underline"
            >
              {allSelected ? 'Alle Abwählen' : 'Alle Auswählen'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allActors.map((actor) => (
              <label
                key={actor}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={presentActors.has(actor)}
                  onChange={() => toggleActor(actor)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text">{actor}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scene Suggestions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">🎬 Szenen-Vorschläge</h3>
          {sceneData.map(({ scene, actors, percentage, isPlayable, missingActors }) => (
            <div
              key={scene}
              className={`bg-surface border rounded-lg p-4 ${
                isPlayable
                  ? 'border-success bg-success/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-text">Szene {scene}</h4>
                <span
                  className={`text-sm font-semibold ${
                    percentage === 100
                      ? 'text-success'
                      : percentage >= 50
                      ? 'text-warning'
                      : 'text-error'
                  }`}
                >
                  {percentage}% anwesend
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {actors.map((actor) => (
                  <span
                    key={actor}
                    className={`px-2 py-1 rounded text-sm ${
                      presentActors.has(actor)
                        ? 'bg-success/20 text-success'
                        : 'bg-error/20 text-error'
                    }`}
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/app/suggestor/page.tsx && git commit -m "feat(suggestor): add casting suggester page with actor attendance"
```

---

## Phase 3: Enhanced Stage Viewer

### Task 3.1: Enhance Stage Page with Current + Next Scene

**Files:**
- Modify: `/home/fedora/projects/skript-next/src/app/stage/page.tsx`

**Step 1: Read current stage page**

Run:
```bash
cat /home/fedora/projects/skript-next/src/app/stage/page.tsx
```

**Step 2: Rewrite stage/page.tsx with enhanced features**

```typescript
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useScriptStore, useSettingsStore, useDirectorStore } from '@/stores'
import { socketManager } from '@/lib/socket'

export default function StagePage() {
  const { scriptData, loadScript, actors } = useScriptStore()
  const { playId } = useSettingsStore()
  const { markedLineIndex, isConnected, currentDirector } = useDirectorStore()
  const [clock, setClock] = useState('00:00:00')

  // Load script
  useEffect(() => {
    if (scriptData.length === 0) {
      loadScript(playId)
    }
  }, [playId, scriptData.length, loadScript])

  // Initialize socket
  useEffect(() => {
    socketManager.init(playId)
    return () => socketManager.disconnect()
  }, [playId])

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setClock(now.toLocaleTimeString('de-DE'))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Current and next scene data
  const { currentLine, nextLine, currentSceneActors, nextSceneActors, progress } = useMemo(() => {
    if (!scriptData.length || markedLineIndex === null) {
      return {
        currentLine: null,
        nextLine: null,
        currentSceneActors: [],
        nextSceneActors: [],
        progress: { percent: 0, current: 0, total: scriptData.length },
      }
    }

    const currentLine = scriptData[markedLineIndex]
    const nextLine = scriptData[markedLineIndex + 1] || null
    const currentScene = currentLine?.Szene
    const nextScene = nextLine?.Szene

    // Get actors for current scene
    const currentSceneActors = Array.from(
      new Set(
        scriptData
          .filter((r) => r.Szene === currentScene && r.Charakter)
          .map((r) => r.Charakter)
      )
    )

    // Get actors for next scene (if different)
    const nextSceneActors =
      nextScene && nextScene !== currentScene
        ? Array.from(
            new Set(
              scriptData
                .filter((r) => r.Szene === nextScene && r.Charakter)
                .map((r) => r.Charakter)
            )
          )
        : []

    return {
      currentLine,
      nextLine,
      currentSceneActors,
      nextSceneActors,
      progress: {
        percent: Math.round(((markedLineIndex + 1) / scriptData.length) * 100),
        current: markedLineIndex + 1,
        total: scriptData.length,
      },
    }
  }, [scriptData, markedLineIndex])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">📺 Bühnen-Viewer</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className={isConnected ? 'text-green-400' : 'text-yellow-400'}>
            {isConnected ? '🟢 Verbunden' : '🔄 Verbinde...'}
          </span>
          <span>👤 Director: {currentDirector || 'Niemand'}</span>
          <span className="font-mono">{clock}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Script Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {currentLine ? (
            <div className="text-center max-w-4xl">
              <div className="text-gray-400 text-lg mb-4">
                Szene {currentLine.Szene} • Zeile {(markedLineIndex || 0) + 1}
              </div>
              {currentLine.Charakter && (
                <div className="text-primary text-2xl font-semibold mb-4">
                  {currentLine.Charakter}
                </div>
              )}
              <div className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight">
                {currentLine['Text/Anweisung']}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-2xl">
              Warte auf Director...
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 flex flex-col gap-4">
          {/* Current Scene */}
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">🎬 Aktuelle Szene</h3>
            {currentSceneActors.length > 0 ? (
              <ul className="space-y-1">
                {currentSceneActors.map((actor) => (
                  <li key={actor} className="text-sm text-gray-300">• {actor}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Keine Schauspieler</p>
            )}
          </div>

          {/* Next Scene */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">⏭️ Nächste Szene</h3>
            {nextSceneActors.length > 0 ? (
              <ul className="space-y-1">
                {nextSceneActors.map((actor) => (
                  <li key={actor} className="text-sm text-gray-300">• {actor}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                {nextLine ? 'Gleiche Szene' : 'Ende des Stücks'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>📊 Fortschritt</span>
          <span>{progress.percent}% ({progress.current}/{progress.total})</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/app/stage/page.tsx && git commit -m "feat(stage): enhance stage viewer with current/next scene and progress bar"
```

---

## Phase 4: Auto-Generated Mic Cues

### Task 4.1: Create Mic Cue Generator

**Files:**
- Create: `/home/fedora/projects/skript-next/src/lib/mic-cue-generator.ts`

**Step 1: Create mic-cue-generator.ts**

```typescript
import type { ScriptRow } from '@/types'

const ACTOR_CATEGORIES = ['Schauspieltext', 'Schauspieler']
const INSTRUCTION_CATEGORIES = ['Anweisung', 'Regieanweisung']

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function textMentionsActor(text: string, actorName: string): boolean {
  if (!text || !actorName) return false
  try {
    const pattern = new RegExp(`\\b${escapeRegExp(actorName)}\\b`, 'i')
    return pattern.test(text)
  } catch {
    return text.toUpperCase().includes(actorName)
  }
}

interface SceneBoundary {
  start: number
  end: number
}

interface ActorInfo {
  firstLine: number
  lastLine: number
  mic: string
}

function getSceneBoundaries(data: ScriptRow[]): Map<string, SceneBoundary> {
  const boundaries = new Map<string, SceneBoundary>()
  let currentScene: string | null = null
  let sceneStart = 0

  data.forEach((row, index) => {
    if (row.Szene && row.Szene !== currentScene) {
      if (currentScene !== null) {
        boundaries.set(currentScene, { start: sceneStart, end: index - 1 })
      }
      currentScene = row.Szene
      sceneStart = index
    }
  })

  if (currentScene !== null) {
    boundaries.set(currentScene, { start: sceneStart, end: data.length - 1 })
  }

  return boundaries
}

function getSpeakingActorsInScene(
  data: ScriptRow[],
  sceneStart: number,
  sceneEnd: number
): Map<string, ActorInfo> {
  const actors = new Map<string, ActorInfo>()

  for (let i = sceneStart; i <= sceneEnd; i++) {
    const row = data[i]
    if (ACTOR_CATEGORIES.includes(row.Kategorie) && row.Charakter) {
      const actor = row.Charakter.toUpperCase()
      if (!actors.has(actor)) {
        actors.set(actor, { firstLine: i, lastLine: i, mic: row.Mikrofon || '' })
      } else {
        const info = actors.get(actor)!
        info.lastLine = i
        if (row.Mikrofon && !info.mic) {
          info.mic = row.Mikrofon
        }
      }
    }
  }

  return actors
}

function findEntranceAnweisung(
  data: ScriptRow[],
  sceneStart: number,
  firstLine: number,
  actorName: string
): number | null {
  for (let i = firstLine - 1; i >= sceneStart; i--) {
    const row = data[i]
    if (
      INSTRUCTION_CATEGORIES.includes(row.Kategorie) &&
      textMentionsActor(row['Text/Anweisung'], actorName)
    ) {
      return i
    }
  }
  return null
}

function findExitAnweisung(
  data: ScriptRow[],
  lastLine: number,
  sceneEnd: number,
  actorName: string
): number | null {
  for (let i = lastLine + 1; i <= sceneEnd; i++) {
    const row = data[i]
    if (
      INSTRUCTION_CATEGORIES.includes(row.Kategorie) &&
      textMentionsActor(row['Text/Anweisung'], actorName)
    ) {
      return i
    }
  }
  return null
}

function createMicCueRow(
  scene: string,
  actors: { name: string; mic: string }[],
  type: 'EIN' | 'AUS'
): ScriptRow {
  const actorTexts = actors.map((a) => (a.mic ? `${a.name} (${a.mic})` : a.name))
  const text = `${actorTexts.join(', ')} ${type}`

  return {
    Szene: scene,
    Kategorie: 'Mikrofon',
    Charakter: '',
    Mikrofon: '',
    'Text/Anweisung': text,
    isAutoMic: true,
    micCueType: type,
  }
}

export function generateSceneMicCues(data: ScriptRow[]): ScriptRow[] {
  if (!data || data.length === 0) return data

  const sceneBoundaries = getSceneBoundaries(data)
  const insertions = new Map<
    number,
    { scene: string; onActors: { name: string; mic: string }[]; offActors: { name: string; mic: string }[] }
  >()

  for (const [scene, { start, end }] of sceneBoundaries) {
    const speakingActors = getSpeakingActorsInScene(data, start, end)

    for (const [actorName, info] of speakingActors) {
      const entranceAnweisung = findEntranceAnweisung(data, start, info.firstLine, actorName)
      const onInsertIdx = entranceAnweisung !== null ? entranceAnweisung + 1 : start + 1

      const exitAnweisung = findExitAnweisung(data, info.lastLine, end, actorName)
      const offInsertIdx = exitAnweisung !== null ? exitAnweisung + 1 : end + 1

      if (!insertions.has(onInsertIdx)) {
        insertions.set(onInsertIdx, { scene, onActors: [], offActors: [] })
      }
      insertions.get(onInsertIdx)!.onActors.push({ name: actorName, mic: info.mic })

      if (!insertions.has(offInsertIdx)) {
        insertions.set(offInsertIdx, { scene, onActors: [], offActors: [] })
      }
      insertions.get(offInsertIdx)!.offActors.push({ name: actorName, mic: info.mic })
    }
  }

  const sortedIndices = Array.from(insertions.keys()).sort((a, b) => b - a)
  const result = [...data]

  for (const idx of sortedIndices) {
    const { scene, onActors, offActors } = insertions.get(idx)!
    const rowsToInsert: ScriptRow[] = []

    if (offActors.length > 0) {
      rowsToInsert.push(createMicCueRow(scene, offActors, 'AUS'))
    }
    if (onActors.length > 0) {
      rowsToInsert.push(createMicCueRow(scene, onActors, 'EIN'))
    }

    result.splice(idx, 0, ...rowsToInsert)
  }

  return result
}
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/lib/mic-cue-generator.ts && git commit -m "feat(lib): add automatic mic cue generator"
```

---

### Task 4.2: Integrate Mic Cues into Script Store

**Files:**
- Modify: `/home/fedora/projects/skript-next/src/stores/script-store.ts`

**Step 1: Read current script store**

Run:
```bash
cat /home/fedora/projects/skript-next/src/stores/script-store.ts
```

**Step 2: Add mic cue generation to loadScript**

Modify the `loadScript` function to call `generateSceneMicCues` after loading data. Add import:

```typescript
import { generateSceneMicCues } from '@/lib/mic-cue-generator'
```

Then in `loadScript`, after setting scriptData, add:

```typescript
// Generate auto mic cues
const dataWithMicCues = generateSceneMicCues(data.script)
set({ scriptData: dataWithMicCues, actors: data.actors, isLoading: false })
```

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/stores/script-store.ts && git commit -m "feat(store): integrate automatic mic cue generation into script loading"
```

---

## Phase 5: Multiple Productions Support

### Task 5.1: Add Plays API Route

**Files:**
- Create: `/home/fedora/projects/skript-next/src/app/api/plays/route.ts`

**Step 1: Create plays API route**

```typescript
import { NextResponse } from 'next/server'

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

export async function GET() {
  try {
    const response = await fetch(`${FLASK_BACKEND_URL}/api/plays`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Flask backend responded with ${response.status}`)
    }

    const plays = await response.json()
    return NextResponse.json(plays)
  } catch (error) {
    console.error('Failed to fetch plays:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plays' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/app/api/plays/route.ts && git commit -m "feat(api): add plays list API route"
```

---

### Task 5.2: Create Plays Store

**Files:**
- Create: `/home/fedora/projects/skript-next/src/stores/plays-store.ts`
- Modify: `/home/fedora/projects/skript-next/src/stores/index.ts`

**Step 1: Create plays-store.ts**

```typescript
'use client'

import { create } from 'zustand'

interface Play {
  id: string
  name: string
}

interface PlaysState {
  plays: Play[]
  isLoading: boolean
  error: string | null
  loadPlays: () => Promise<void>
}

export const usePlaysStore = create<PlaysState>((set) => ({
  plays: [],
  isLoading: false,
  error: null,

  loadPlays: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/plays')
      if (!response.ok) {
        throw new Error('Failed to load plays')
      }
      const plays = await response.json()
      set({ plays, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
```

**Step 2: Update stores/index.ts**

Add:
```typescript
export { usePlaysStore } from './plays-store'
```

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/stores/plays-store.ts src/stores/index.ts && git commit -m "feat(store): add plays store for multi-production support"
```

---

### Task 5.3: Add Play Selector to Settings Modal

**Files:**
- Modify: `/home/fedora/projects/skript-next/src/components/settings/settings-modal.tsx`

**Step 1: Read current settings modal**

Run:
```bash
cat /home/fedora/projects/skript-next/src/components/settings/settings-modal.tsx
```

**Step 2: Add play selector section**

Add import and hook:
```typescript
import { usePlaysStore } from '@/stores'
```

Inside component, add:
```typescript
const { plays, loadPlays } = usePlaysStore()

useEffect(() => {
  loadPlays()
}, [loadPlays])
```

Add in the Production section (before actor selector):
```tsx
{/* Play Selector */}
{plays.length > 1 && (
  <div className="mb-4">
    <label className="text-sm font-medium text-text mb-2 block">
      Stück auswählen
    </label>
    <Select
      value={playId}
      onChange={(e) => {
        setPlayId(e.target.value)
        // Reload script with new play
        window.location.reload()
      }}
      options={plays.map((p) => ({ value: p.id, label: p.name }))}
    />
  </div>
)}
```

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/components/settings/settings-modal.tsx && git commit -m "feat(settings): add play selector for multi-production support"
```

---

## Phase 6: Quick Links in Settings

### Task 6.1: Add Quick Links Section to Settings

**Files:**
- Modify: `/home/fedora/projects/skript-next/src/components/settings/settings-modal.tsx`

**Step 1: Add Quick Links section at the end of settings modal**

```tsx
{/* Quick Links */}
<div className="border-t border-border pt-4 mt-4">
  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
    Quick Links
  </h3>
  <div className="grid grid-cols-2 gap-2">
    <Link
      href="/stats"
      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
    >
      📊 Statistiken
    </Link>
    <Link
      href="/suggestor"
      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
    >
      🎲 Rollenvorschläge
    </Link>
    <Link
      href="/stage"
      target="_blank"
      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
    >
      📺 Bühnen-Viewer
    </Link>
    <Link
      href="/actor"
      target="_blank"
      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
    >
      🎭 Schauspieler-Viewer
    </Link>
  </div>
</div>
```

Add Link import:
```typescript
import Link from 'next/link'
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/components/settings/settings-modal.tsx && git commit -m "feat(settings): add quick links section for navigation"
```

---

## Phase 7: PWA Support

### Task 7.1: Create Service Worker

**Files:**
- Create: `/home/fedora/projects/skript-next/public/sw.js`

**Step 1: Create service worker**

```javascript
const CACHE_NAME = 'skript-next-v1'
const STATIC_ASSETS = [
  '/',
  '/logo.png',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Network-first for API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Clone and cache new responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
    })
  )
})

// Listen for update messages
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add public/sw.js && git commit -m "feat(pwa): add service worker for offline support"
```

---

### Task 7.2: Create PWA Registration Component

**Files:**
- Create: `/home/fedora/projects/skript-next/src/components/layout/pwa-register.tsx`

**Step 1: Create PWA registration component**

```typescript
'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered'))
        .catch((err) => console.log('SW registration failed:', err))
    }
  }, [])

  return null
}
```

**Step 2: Add to layout.tsx**

Import and add the component inside ThemeProvider:
```tsx
import { PWARegister } from '@/components/layout/pwa-register'

// In the layout:
<ThemeProvider>
  <PWARegister />
  {children}
</ThemeProvider>
```

**Step 3: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/components/layout/pwa-register.tsx src/app/layout.tsx && git commit -m "feat(pwa): add PWA registration component"
```

---

### Task 7.3: Update Manifest File

**Files:**
- Modify: `/home/fedora/projects/skript-next/public/manifest.json`

**Step 1: Ensure manifest.json exists with proper content**

```json
{
  "name": "Drehbuch Viewer",
  "short_name": "Drehbuch",
  "description": "Interaktiver Drehbuch-Viewer für das Kolpingtheater Ramsen",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f10",
  "theme_color": "#FF6A00",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add public/manifest.json && git commit -m "feat(pwa): update web app manifest"
```

---

## Phase 8: Final Integration & Testing

### Task 8.1: Update Stores Index Export

**Files:**
- Modify: `/home/fedora/projects/skript-next/src/stores/index.ts`

**Step 1: Ensure all stores are exported**

```typescript
export { useScriptStore } from './script-store'
export { useSettingsStore } from './settings-store'
export { useDirectorStore } from './director-store'
export { useNotesStore } from './notes-store'
export { useUIStore } from './ui-store'
export { usePlaysStore } from './plays-store'
export { useSuggesterStore, getUniqueActors, getSceneActors, calculateSceneAvailability } from './suggester-store'
```

**Step 2: Commit**

```bash
cd /home/fedora/projects/skript-next && git add src/stores/index.ts && git commit -m "chore(stores): ensure all stores are exported"
```

---

### Task 8.2: Build and Test

**Step 1: Run type check**

Run:
```bash
cd /home/fedora/projects/skript-next && npm run type-check
```
Expected: No TypeScript errors

**Step 2: Run lint**

Run:
```bash
cd /home/fedora/projects/skript-next && npm run lint
```
Expected: No lint errors

**Step 3: Build production**

Run:
```bash
cd /home/fedora/projects/skript-next && npm run build
```
Expected: Successful build

**Step 4: Final commit**

```bash
cd /home/fedora/projects/skript-next && git add -A && git commit -m "chore: complete feature parity implementation"
```

---

## Summary

| Phase | Feature | Files Created/Modified |
|-------|---------|------------------------|
| 1 | Statistics Page | `src/app/stats/page.tsx`, `src/lib/stats.ts`, `src/types/index.ts` |
| 2 | Casting Suggester | `src/app/suggestor/page.tsx`, `src/stores/suggester-store.ts` |
| 3 | Enhanced Stage Viewer | `src/app/stage/page.tsx` |
| 4 | Auto Mic Cues | `src/lib/mic-cue-generator.ts`, `src/stores/script-store.ts` |
| 5 | Multi-Production | `src/app/api/plays/route.ts`, `src/stores/plays-store.ts`, `settings-modal.tsx` |
| 6 | Quick Links | `src/components/settings/settings-modal.tsx` |
| 7 | PWA Support | `public/sw.js`, `src/components/layout/pwa-register.tsx`, `public/manifest.json` |
| 8 | Integration | Store exports, testing |

**Total Tasks:** 17 bite-sized implementation steps
