'use client'

import { useMemo, useCallback, useEffect, useRef } from 'react'
import { useScriptStore } from '@/stores/script-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useDirectorStore } from '@/stores/director-store'
import { useUIStore } from '@/stores/ui-store'
import { useNotesStore } from '@/stores/notes-store'
import { CATEGORIES, ACTOR_CATEGORIES } from '@/lib/constants'
import { scrollToLineWithFlash } from '@/lib/utils'
import { socketManager } from '@/lib/socket'
import { ScriptLine } from './script-line'
import { SceneHeader } from './scene-header'
import { SceneOverview } from './scene-overview'
import { TableOfContents } from './table-of-contents'
import type { ScriptRow, LineState } from '@/types'

export function ScriptViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const { scriptData, playId } = useScriptStore()
  // Use individual selectors to ensure reactivity
  const hasHydrated = useSettingsStore((state) => state._hasHydrated)
  const showActorText = useSettingsStore((state) => state.showActorText)
  const showDirections = useSettingsStore((state) => state.showDirections)
  const showTechnical = useSettingsStore((state) => state.showTechnical)
  const showLighting = useSettingsStore((state) => state.showLighting)
  const showEinspieler = useSettingsStore((state) => state.showEinspieler)
  const showRequisiten = useSettingsStore((state) => state.showRequisiten)
  const showMikrofonCues = useSettingsStore((state) => state.showMikrofonCues)
  const directionsContext = useSettingsStore((state) => state.directionsContext)
  const technicalContext = useSettingsStore((state) => state.technicalContext)
  const lightingContext = useSettingsStore((state) => state.lightingContext)
  const einspielContext = useSettingsStore((state) => state.einspielContext)
  const requisitenContext = useSettingsStore((state) => state.requisitenContext)
  const mikrofonContext = useSettingsStore((state) => state.mikrofonContext)
  const autoScroll = useSettingsStore((state) => state.autoScroll)
  const showSceneOverview = useSettingsStore((state) => state.showSceneOverview)
  const { isDirector, markedLineIndex, setMarkedLineIndex } = useDirectorStore()
  const { setCurrentScene } = useUIStore()
  const { loadNotes } = useNotesStore()

  // Load notes when play changes
  useEffect(() => {
    loadNotes(playId)
  }, [playId, loadNotes])

  // Calculate line visibility states
  const lineStates = useMemo(() => {
    const states = new Map<number, LineState>()

    // First pass: determine visibility for each line
    scriptData.forEach((row, index) => {
      const isVisible = Boolean(
        (showDirections && row.Kategorie === CATEGORIES.INSTRUCTION) ||
        (showTechnical && row.Kategorie === CATEGORIES.TECHNICAL) ||
        (showLighting && row.Kategorie === CATEGORIES.LIGHTING) ||
        (showEinspieler && row.Kategorie === CATEGORIES.AUDIO) ||
        (showRequisiten && row.Kategorie === CATEGORIES.PROPS) ||
        (showMikrofonCues && row.Kategorie === CATEGORIES.MICROPHONE) ||
        (showActorText &&
          row.Charakter &&
          ACTOR_CATEGORIES.includes(row.Kategorie))
      )

      states.set(index, { visible: isVisible, isContext: false })
    })

    // Second pass: mark context lines around visible lines
    scriptData.forEach((row, index) => {
      const state = states.get(index)
      if (!state?.visible) return

      // Determine context range based on category
      let contextRange = 0
      if (row.Kategorie === CATEGORIES.INSTRUCTION)
        contextRange = directionsContext
      else if (row.Kategorie === CATEGORIES.TECHNICAL)
        contextRange = technicalContext
      else if (row.Kategorie === CATEGORIES.LIGHTING)
        contextRange = lightingContext
      else if (row.Kategorie === CATEGORIES.AUDIO)
        contextRange = einspielContext
      else if (row.Kategorie === CATEGORIES.PROPS)
        contextRange = requisitenContext
      else if (row.Kategorie === CATEGORIES.MICROPHONE)
        contextRange = mikrofonContext

      // Mark context lines
      for (
        let i = Math.max(0, index - contextRange);
        i <= Math.min(scriptData.length - 1, index + contextRange);
        i++
      ) {
        if (i !== index) {
          const contextState = states.get(i)!
          contextState.isContext = true
        }
      }
    })

    return states
  }, [
    scriptData,
    showActorText,
    showDirections,
    showTechnical,
    showLighting,
    showEinspieler,
    showRequisiten,
    showMikrofonCues,
    directionsContext,
    technicalContext,
    lightingContext,
    einspielContext,
    requisitenContext,
    mikrofonContext,
  ])

  // Handle line click
  const handleLineClick = useCallback(
    (index: number) => {
      if (isDirector) {
        setMarkedLineIndex(index)
        socketManager.setMarker(index)
      }
    },
    [isDirector, setMarkedLineIndex]
  )

  // Scroll to marked line with flash effect
  useEffect(() => {
    if (markedLineIndex !== null && autoScroll) {
      scrollToLineWithFlash(markedLineIndex)
    }
  }, [markedLineIndex, autoScroll])

  // Track current scene on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Find which scene header is closest to top
      const headers = document.querySelectorAll('[id^="scene-"]')
      let currentScene = ''

      headers.forEach((header) => {
        const rect = header.getBoundingClientRect()
        if (rect.top <= 100) {
          currentScene = header.id.replace('scene-', '')
        }
      })

      if (currentScene) {
        setCurrentScene(currentScene)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setCurrentScene])

  // Group data by scenes
  const scenes = useMemo(() => {
    const result: Array<{
      scene: string
      summary: string | null
      data: Array<{ row: ScriptRow; index: number }>
    }> = []

    let currentScene = ''
    let currentData: Array<{ row: ScriptRow; index: number }> = []

    scriptData.forEach((row, index) => {
      if (row.Szene !== currentScene) {
        if (currentScene) {
          result.push({
            scene: currentScene,
            summary:
              scriptData.find(
                (r) =>
                  r.Szene === currentScene &&
                  r.Kategorie === CATEGORIES.SCENE_START
              )?.['Text/Anweisung'] || null,
            data: currentData,
          })
        }
        currentScene = row.Szene
        currentData = []
      }
      currentData.push({ row, index })
    })

    // Don't forget the last scene
    if (currentScene) {
      result.push({
        scene: currentScene,
        summary:
          scriptData.find(
            (r) =>
              r.Szene === currentScene && r.Kategorie === CATEGORIES.SCENE_START
          )?.['Text/Anweisung'] || null,
        data: currentData,
      })
    }

    return result
  }, [scriptData])

  // Get scene data for overview
  const getSceneData = (sceneData: Array<{ row: ScriptRow; index: number }>) =>
    sceneData.map((d) => d.row)

  // Show loading state until settings have been hydrated from localStorage
  if (!hasHydrated) {
    return (
      <div className="max-w-[960px] mx-auto p-6 md:p-4 bg-[var(--color-surface)] rounded-xl md:rounded-none shadow-md dark:shadow-lg transition-colors">
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p>Lade Einstellungen...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="max-w-[960px] mx-auto p-6 md:p-4 bg-[var(--color-surface)] rounded-xl md:rounded-none shadow-md dark:shadow-lg transition-colors"
    >
      {/* Table of Contents */}
      <TableOfContents />

      {/* Render scenes */}
      {scenes.map(({ scene, summary, data }) => (
        <div key={scene}>
          <SceneHeader scene={scene} summary={summary || undefined} />

          {showSceneOverview && (
            <SceneOverview sceneData={getSceneData(data)} />
          )}

          {data.map(({ row, index }) => {
            const state = lineStates.get(index)
            if (!state?.visible && !state?.isContext) return null

            return (
              <div
                key={index}
                data-line-index={index}
                ref={(el) => {
                  if (el) lineRefs.current.set(index, el)
                }}
              >
                <ScriptLine
                  row={row}
                  index={index}
                  isMarked={markedLineIndex === index}
                  isContext={state?.isContext && !state?.visible}
                  onClick={() => handleLineClick(index)}
                />
              </div>
            )
          })}
        </div>
      ))}

      {/* Empty state */}
      {scriptData.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-xl mb-2">📜</p>
          <p>Kein Skript geladen</p>
        </div>
      )}
    </div>
  )
}
