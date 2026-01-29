'use client'

import { io, Socket } from 'socket.io-client'
import { SOCKET_CONFIG } from './constants'
import type { MarkerUpdateData, DirectorData } from '@/types'

type SocketCallback<T = void> = T extends void ? () => void : (data: T) => void

interface SocketCallbacks {
  connect: SocketCallback[]
  disconnect: SocketCallback<string>[]
  connectError: SocketCallback<Error>[]
  markerUpdate: SocketCallback<MarkerUpdateData>[]
  markerClear: SocketCallback[]
  setDirector: SocketCallback<DirectorData>[]
  unsetDirector: SocketCallback<DirectorData>[]
  directorTakeover: SocketCallback<DirectorData>[]
}

class SocketManager {
  private socket: Socket | null = null
  private playId: string | null = null
  private callbacks: SocketCallbacks = {
    connect: [],
    disconnect: [],
    connectError: [],
    markerUpdate: [],
    markerClear: [],
    setDirector: [],
    unsetDirector: [],
    directorTakeover: [],
  }

  /**
   * Initialize socket connection
   */
  init(playId: string): void {
    if (this.socket) {
      this.disconnect()
    }

    this.playId = playId
    this.socket = io(SOCKET_CONFIG.URL, SOCKET_CONFIG.OPTIONS)
    this.setupEventHandlers()
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server')
      this.trigger('connect')

      // Join play room
      if (this.playId) {
        this.socket?.emit('join_play', { playId: this.playId })
      }
    })

    this.socket.on('connect_error', (error: Error) => {
      console.error('[Socket] Connection error:', error)
      this.trigger('connectError', error)
    })

    this.socket.on('disconnect', (reason: string) => {
      console.log('[Socket] Disconnected:', reason)
      this.trigger('disconnect', reason)
    })

    this.socket.on('marker_update', (data: MarkerUpdateData) => {
      this.trigger('markerUpdate', data)
    })

    this.socket.on('marker_clear', () => {
      this.trigger('markerClear')
    })

    this.socket.on('set_director', (data: DirectorData) => {
      this.trigger('setDirector', data)
    })

    this.socket.on('unset_director', (data: DirectorData) => {
      this.trigger('unsetDirector', data)
    })

    this.socket.on('director_takeover', (data: DirectorData) => {
      this.trigger('directorTakeover', data)
    })
  }

  /**
   * Register callback for socket events
   */
  on<K extends keyof SocketCallbacks>(
    event: K,
    callback: SocketCallbacks[K][number]
  ): void {
    // @ts-expect-error - callback type is correct
    this.callbacks[event].push(callback)
  }

  /**
   * Remove callback for socket events
   */
  off<K extends keyof SocketCallbacks>(
    event: K,
    callback: SocketCallbacks[K][number]
  ): void {
    const index = this.callbacks[event].indexOf(callback as never)
    if (index > -1) {
      this.callbacks[event].splice(index, 1)
    }
  }

  /**
   * Trigger callbacks for an event
   */
  private trigger<K extends keyof SocketCallbacks>(
    event: K,
    ...args: Parameters<SocketCallbacks[K][number]>
  ): void {
    this.callbacks[event].forEach((callback) => {
      try {
        // @ts-expect-error - args type is correct
        callback(...args)
      } catch (error) {
        console.error(`[Socket] Error in ${event} callback:`, error)
      }
    })
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: unknown): void {
    if (!this.socket) {
      console.error('[Socket] Socket not initialized')
      return
    }

    try {
      this.socket.emit(event, data)
    } catch (error) {
      console.error(`[Socket] Failed to emit ${event}:`, error)
    }
  }

  /**
   * Set marker position (director only)
   */
  setMarker(index: number): void {
    this.emit('set_marker', { index })
  }

  /**
   * Clear marker (director only)
   */
  clearMarker(): void {
    this.emit('clear_marker')
  }

  /**
   * Set director
   */
  setDirector(name: string, password: string): void {
    this.emit('set_director', { name, password })
  }

  /**
   * Unset director
   */
  unsetDirector(name: string): void {
    this.emit('unset_director', { name })
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

// Export singleton instance
export const socketManager = new SocketManager()
