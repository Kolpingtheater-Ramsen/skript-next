'use client'

import { create } from 'zustand'
import { STORAGE_KEYS } from '@/lib/constants'
import { isBrowser } from '@/lib/utils'

interface Notes {
  [lineId: string]: string
}

interface NotesState {
  notes: Notes
  currentPlayId: string

  loadNotes: (playId: string) => void
  getNote: (lineId: string) => string | null
  setNote: (lineId: string, note: string) => void
  deleteNote: (lineId: string) => void
  clearAllNotes: () => void
}

function getStorageKey(playId: string): string {
  return `${STORAGE_KEYS.NOTES_PREFIX}:${playId}`
}

function loadNotesFromStorage(playId: string): Notes {
  if (!isBrowser) return {}
  try {
    const stored = localStorage.getItem(getStorageKey(playId))
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveNotesToStorage(playId: string, notes: Notes): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(getStorageKey(playId), JSON.stringify(notes))
  } catch (e) {
    console.warn('Failed to save notes:', e)
  }
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: {},
  currentPlayId: 'default',

  loadNotes: (playId) => {
    const notes = loadNotesFromStorage(playId)
    set({ notes, currentPlayId: playId })
  },

  getNote: (lineId) => {
    return get().notes[lineId] || null
  },

  setNote: (lineId, note) => {
    const { notes, currentPlayId } = get()
    const trimmedNote = note.trim()

    if (trimmedNote) {
      const newNotes = { ...notes, [lineId]: trimmedNote }
      set({ notes: newNotes })
      saveNotesToStorage(currentPlayId, newNotes)
    } else {
      // Empty note = delete
      const { [lineId]: _, ...newNotes } = notes
      set({ notes: newNotes })
      saveNotesToStorage(currentPlayId, newNotes)
    }
  },

  deleteNote: (lineId) => {
    const { notes, currentPlayId } = get()
    const { [lineId]: _, ...newNotes } = notes
    set({ notes: newNotes })
    saveNotesToStorage(currentPlayId, newNotes)
  },

  clearAllNotes: () => {
    const { currentPlayId } = get()
    set({ notes: {} })
    saveNotesToStorage(currentPlayId, {})
  },
}))
