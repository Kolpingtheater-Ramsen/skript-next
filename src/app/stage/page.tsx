'use client'

import { useEffect, useState, useMemo } from 'react'
import { useDirectorStore } from '@/stores/director-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useScriptStore } from '@/stores/script-store'
import { socketManager } from '@/lib/socket'

/**
 * Stage Display - Enhanced large display for stage/audience view
 * Shows current line, scene actors, progress, and connection status
 */
export default function StagePage() {
  const {
    markedLineIndex,
    setMarkedLineIndex,
    isConnected,
    setIsConnected,
    setIsReconnecting,
    currentDirector,
    setCurrentDirector,
  } = useDirectorStore()
  const { playId } = useSettingsStore()
  const { scriptData, loadScript } = useScriptStore()

  // Live clock state
  const [currentTime, setCurrentTime] = useState<string>('')

  // Initialize socket and load script
  useEffect(() => {
    socketManager.init(playId)

    socketManager.on('connect', () => {
      setIsConnected(true)
      setIsReconnecting(false)
    })

    socketManager.on('disconnect', () => {
      setIsConnected(false)
      setIsReconnecting(true)
    })

    socketManager.on('markerUpdate', (data) => {
      setMarkedLineIndex(data.index)
    })

    socketManager.on('markerClear', () => {
      setMarkedLineIndex(null)
    })

    socketManager.on('setDirector', (data) => {
      setCurrentDirector(data.name)
    })

    socketManager.on('unsetDirector', () => {
      setCurrentDirector(null)
    })

    // Load script if not already loaded
    if (scriptData.length === 0) {
      loadScript(playId)
    }

    return () => {
      socketManager.disconnect()
    }
  }, [
    playId,
    loadScript,
    setIsConnected,
    setIsReconnecting,
    setMarkedLineIndex,
    setCurrentDirector,
    scriptData.length,
  ])

  // Live clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [])

  // Get current line
  const currentLine =
    markedLineIndex !== null ? scriptData[markedLineIndex] : null
  const currentScene = currentLine?.Szene || null

  // Calculate actors for current and next scene
  const { currentSceneActors, nextSceneActors, nextSceneName, isLastScene } =
    useMemo(() => {
      if (!currentScene || scriptData.length === 0) {
        return {
          currentSceneActors: [],
          nextSceneActors: [],
          nextSceneName: null,
          isLastScene: false,
        }
      }

      // Get unique actors in current scene
      const currentActors = new Set<string>()
      scriptData
        .filter((row) => row.Szene === currentScene && row.Charakter)
        .forEach((row) => currentActors.add(row.Charakter))

      // Find all unique scenes
      const scenes = [...new Set(scriptData.map((row) => row.Szene))]
      const currentSceneIndex = scenes.indexOf(currentScene)
      const isLast = currentSceneIndex === scenes.length - 1
      const nextScene = isLast ? null : scenes[currentSceneIndex + 1]

      // Get unique actors in next scene
      const nextActors = new Set<string>()
      if (nextScene) {
        scriptData
          .filter((row) => row.Szene === nextScene && row.Charakter)
          .forEach((row) => nextActors.add(row.Charakter))
      }

      return {
        currentSceneActors: Array.from(currentActors).sort(),
        nextSceneActors: Array.from(nextActors).sort(),
        nextSceneName: nextScene,
        isLastScene: isLast,
      }
    }, [currentScene, scriptData])

  // Calculate progress
  const progress = useMemo(() => {
    if (scriptData.length === 0 || markedLineIndex === null) {
      return { percent: 0, current: 0, total: 0 }
    }
    const percent = Math.round(
      ((markedLineIndex + 1) / scriptData.length) * 100
    )
    return {
      percent,
      current: markedLineIndex + 1,
      total: scriptData.length,
    }
  }, [markedLineIndex, scriptData.length])

  // Check if next scene has different actors
  const isSceneChange = useMemo(() => {
    if (!nextSceneName) return false
    const currentSet = new Set(currentSceneActors)
    const nextSet = new Set(nextSceneActors)
    if (currentSet.size !== nextSet.size) return true
    for (const actor of currentSet) {
      if (!nextSet.has(actor)) return true
    }
    return false
  }, [currentSceneActors, nextSceneActors, nextSceneName])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header bar */}
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">📺 Bühnen-Viewer</h1>
        <div className="flex items-center gap-6">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <span className="text-green-400">🟢</span>
                <span className="text-gray-300">Verbunden</span>
              </>
            ) : (
              <>
                <span className="animate-spin">🔄</span>
                <span className="text-gray-400">Verbinde...</span>
              </>
            )}
          </div>
          {/* Director display */}
          <div className="flex items-center gap-2 text-gray-300">
            <span>👤</span>
            <span>Director: {currentDirector || 'Niemand'}</span>
          </div>
          {/* Live clock */}
          <div className="text-gray-300 font-mono text-lg">{currentTime}</div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Left side - Current script line */}
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full text-center">
            {currentLine ? (
              <>
                {/* Scene and line info */}
                <div className="text-lg text-gray-500 mb-4">
                  Szene {currentLine.Szene} • Zeile {markedLineIndex! + 1}
                </div>

                {/* Character name */}
                {currentLine.Charakter && (
                  <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-6">
                    {currentLine.Charakter}
                  </div>
                )}

                {/* Line text */}
                <div className="text-4xl md:text-6xl leading-relaxed">
                  {currentLine['Text/Anweisung']}
                </div>
              </>
            ) : (
              <div className="text-3xl text-gray-500">
                <div className="text-6xl mb-4">📺</div>
                <div>Warte auf Director...</div>
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="w-80 bg-gray-900 p-4 flex flex-col gap-4">
          {/* Current Scene box */}
          <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-400 mb-3">
              🎭 Aktuelle Szene
              {currentScene && (
                <span className="text-green-300 ml-2">({currentScene})</span>
              )}
            </h2>
            {currentSceneActors.length > 0 ? (
              <ul className="space-y-1">
                {currentSceneActors.map((actor) => (
                  <li key={actor} className="text-gray-200">
                    • {actor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Keine Schauspieler</p>
            )}
          </div>

          {/* Next Scene box */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-400 mb-3">
              ⏭️ Nächste Szene
              {nextSceneName && (
                <span className="text-blue-300 ml-2">({nextSceneName})</span>
              )}
            </h2>
            {isLastScene ? (
              <p className="text-gray-400 italic">Ende des Stücks</p>
            ) : !isSceneChange && nextSceneName ? (
              <p className="text-gray-400 italic">Gleiche Szene</p>
            ) : nextSceneActors.length > 0 ? (
              <ul className="space-y-1">
                {nextSceneActors.map((actor) => (
                  <li key={actor} className="text-gray-200">
                    • {actor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Keine Schauspieler</p>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom progress bar */}
      <footer className="bg-gray-800 px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">📊 Fortschritt</span>
          <span className="text-gray-300 min-w-[120px]">
            {progress.percent}% ({progress.current}/{progress.total})
          </span>
          <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
