'use client'

import { useEffect } from 'react'
import { useDirectorStore } from '@/stores/director-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useScriptStore } from '@/stores/script-store'
import { socketManager } from '@/lib/socket'
import { cn } from '@/lib/utils'

/**
 * Stage Display - Large display for stage/audience view
 * Shows only the current marked line in a clean, readable format
 */
export default function StagePage() {
  const { markedLineIndex, setMarkedLineIndex, setIsConnected, setIsReconnecting } =
    useDirectorStore()
  const { playId } = useSettingsStore()
  const { scriptData, loadScript } = useScriptStore()

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

    loadScript(playId)

    return () => {
      socketManager.disconnect()
    }
  }, [playId, loadScript, setIsConnected, setIsReconnecting, setMarkedLineIndex])

  // Get current line
  const currentLine =
    markedLineIndex !== null ? scriptData[markedLineIndex] : null

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        {currentLine ? (
          <>
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

            {/* Microphone info */}
            {currentLine.Mikrofon && (
              <div className="mt-8 text-2xl text-gray-400">
                🎤 Mikrofon {currentLine.Mikrofon}
              </div>
            )}

            {/* Scene info */}
            <div className="mt-8 text-xl text-gray-500">
              Szene {currentLine.Szene} • Zeile{' '}
              {markedLineIndex !== null ? markedLineIndex + 1 : '-'} /{' '}
              {scriptData.length}
            </div>
          </>
        ) : (
          <div className="text-3xl text-gray-500">
            <div className="text-6xl mb-4">📺</div>
            <div>Warte auf Director...</div>
          </div>
        )}
      </div>

      {/* Connection status indicator */}
      <div
        className={cn(
          'fixed bottom-4 right-4 w-3 h-3 rounded-full',
          useDirectorStore.getState().isConnected
            ? 'bg-green-500'
            : 'bg-red-500 animate-pulse'
        )}
        title={
          useDirectorStore.getState().isConnected
            ? 'Verbunden'
            : 'Verbindung getrennt'
        }
      />
    </div>
  )
}
