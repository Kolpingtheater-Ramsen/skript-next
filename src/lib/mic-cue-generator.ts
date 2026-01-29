import type { ScriptRow } from '@/types'
import { escapeRegExp } from './utils'

const ACTOR_CATEGORIES = ['Schauspieltext', 'Schauspieler']

interface ActorSpeakingInfo {
  firstLine: number
  lastLine: number
  mic: string
}

interface SceneBoundary {
  start: number
  end: number
}

/**
 * Check if text mentions an actor by name
 * Handles variations like "ACTOR kommt", "ACTOR ab", etc.
 */
export function textMentionsActor(text: string, actorName: string): boolean {
  if (!text || !actorName) return false
  const escapedName = escapeRegExp(actorName)
  // Match actor name as whole word (case insensitive)
  const regex = new RegExp(`\\b${escapedName}\\b`, 'i')
  return regex.test(text)
}

/**
 * Get scene boundaries as a map of scene name to start/end indices
 */
export function getSceneBoundaries(data: ScriptRow[]): Map<string, SceneBoundary> {
  const boundaries = new Map<string, SceneBoundary>()
  let currentScene = ''
  let sceneStart = 0

  data.forEach((row, index) => {
    const scene = row.Szene
    if (scene && scene !== currentScene) {
      // Close previous scene
      if (currentScene && boundaries.has(currentScene)) {
        const prev = boundaries.get(currentScene)!
        boundaries.set(currentScene, { start: prev.start, end: index - 1 })
      }
      // Start new scene
      currentScene = scene
      sceneStart = index
      boundaries.set(scene, { start: sceneStart, end: data.length - 1 })
    }
  })

  // Close final scene
  if (currentScene && boundaries.has(currentScene)) {
    const prev = boundaries.get(currentScene)!
    boundaries.set(currentScene, { start: prev.start, end: data.length - 1 })
  }

  return boundaries
}

/**
 * Get all speaking actors within a scene range
 * Returns map of actor name to their first/last line indices and mic assignment
 */
export function getSpeakingActorsInScene(
  data: ScriptRow[],
  start: number,
  end: number
): Map<string, ActorSpeakingInfo> {
  const actors = new Map<string, ActorSpeakingInfo>()

  for (let i = start; i <= end; i++) {
    const row = data[i]
    if (!ACTOR_CATEGORIES.includes(row.Kategorie)) continue

    let actor = row.Charakter
    if (!actor) continue

    // Clean actor name (remove parenthetical notes, trim, uppercase)
    actor = actor.replace(/\(.*\)/, '').trim().toUpperCase()
    if (!actor) continue

    const mic = row.Mikrofon || ''

    if (!actors.has(actor)) {
      actors.set(actor, { firstLine: i, lastLine: i, mic })
    } else {
      const info = actors.get(actor)!
      actors.set(actor, { ...info, lastLine: i })
    }
  }

  return actors
}

/**
 * Find an Anweisung row that mentions the actor before their first spoken line
 * Searches backwards from firstLine to sceneStart
 */
export function findEntranceAnweisung(
  data: ScriptRow[],
  sceneStart: number,
  firstLine: number,
  actorName: string
): number | null {
  // Search from firstLine backwards to sceneStart for an Anweisung mentioning the actor
  for (let i = firstLine - 1; i >= sceneStart; i--) {
    const row = data[i]
    if (row.Kategorie === 'Anweisung' || row.Kategorie === 'Regieanweisung') {
      const text = row['Text/Anweisung'] || ''
      if (textMentionsActor(text, actorName)) {
        return i
      }
    }
  }
  return null
}

/**
 * Find an Anweisung row that mentions the actor after their last spoken line
 * Searches forwards from lastLine to sceneEnd
 */
export function findExitAnweisung(
  data: ScriptRow[],
  lastLine: number,
  sceneEnd: number,
  actorName: string
): number | null {
  // Search from lastLine forwards to sceneEnd for an Anweisung mentioning the actor
  for (let i = lastLine + 1; i <= sceneEnd; i++) {
    const row = data[i]
    if (row.Kategorie === 'Anweisung' || row.Kategorie === 'Regieanweisung') {
      const text = row['Text/Anweisung'] || ''
      if (textMentionsActor(text, actorName)) {
        return i
      }
    }
  }
  return null
}

/**
 * Create a virtual mic cue row
 */
export function createMicCueRow(
  scene: string,
  actors: Array<{ name: string; mic: string }>,
  type: 'EIN' | 'AUS'
): ScriptRow {
  const actorText = actors
    .map((a) => (a.mic ? `${a.name} (${a.mic})` : a.name))
    .join(', ')

  return {
    Szene: scene,
    Kategorie: 'Mikrofon',
    Charakter: '',
    Mikrofon: '',
    'Text/Anweisung': `${actorText} ${type}`,
    isAutoMic: true,
    micCueType: type,
  }
}

/**
 * Main function: Generate automatic mic cues for the entire script
 * Inserts MIC EIN after entrance and MIC AUS after exit for each actor in each scene
 */
export function generateSceneMicCues(data: ScriptRow[]): ScriptRow[] {
  if (!data || data.length === 0) return data

  const sceneBoundaries = getSceneBoundaries(data)
  const result: ScriptRow[] = []

  // Track insertion points for grouping actors
  // Key: insertion index, Value: { ein: actors[], aus: actors[] }
  interface InsertionGroup {
    ein: Array<{ name: string; mic: string }>
    aus: Array<{ name: string; mic: string }>
  }

  for (const [scene, { start, end }] of sceneBoundaries) {
    const insertions = new Map<number, InsertionGroup>()
    const speakingActors = getSpeakingActorsInScene(data, start, end)

    for (const [actorName, info] of speakingActors) {
      // Find entrance point
      const entranceAnweisung = findEntranceAnweisung(data, start, info.firstLine, actorName)
      // Insert EIN after entrance Anweisung, or after scene start if no entrance found
      const einInsertAfter = entranceAnweisung !== null ? entranceAnweisung : start

      // Find exit point
      const exitAnweisung = findExitAnweisung(data, info.lastLine, end, actorName)
      // Insert AUS after exit Anweisung, or after last line if no exit found
      const ausInsertAfter = exitAnweisung !== null ? exitAnweisung : info.lastLine

      // Group EIN cues
      if (!insertions.has(einInsertAfter)) {
        insertions.set(einInsertAfter, { ein: [], aus: [] })
      }
      insertions.get(einInsertAfter)!.ein.push({ name: actorName, mic: info.mic })

      // Group AUS cues
      if (!insertions.has(ausInsertAfter)) {
        insertions.set(ausInsertAfter, { ein: [], aus: [] })
      }
      insertions.get(ausInsertAfter)!.aus.push({ name: actorName, mic: info.mic })
    }

    // Process rows for this scene, inserting cues at appropriate points
    for (let i = start; i <= end; i++) {
      result.push(data[i])

      const group = insertions.get(i)
      if (group) {
        // Insert EIN cues first (actors entering)
        if (group.ein.length > 0) {
          result.push(createMicCueRow(scene, group.ein, 'EIN'))
        }
        // Insert AUS cues second (actors exiting)
        if (group.aus.length > 0) {
          result.push(createMicCueRow(scene, group.aus, 'AUS'))
        }
      }
    }
  }

  return result
}
