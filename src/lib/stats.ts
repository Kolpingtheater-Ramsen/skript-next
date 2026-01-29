import type { ScriptRow, ScriptStats, ActorStats } from '@/types'

const BLACKLIST = ['OFFTEXT', 'ALLE', 'LIED', '[LIED]', 'CHOR']
const ACTOR_CATEGORIES = ['Schauspieltext', 'Schauspieler']

export function calculateStats(data: ScriptRow[]): ScriptStats {
  const actors: Record<string, { occurrences: number; words: number }> = {}
  const scenes = new Set<string>()

  data.forEach((row) => {
    if (row.Szene) scenes.add(row.Szene)
    if (!ACTOR_CATEGORIES.includes(row.Kategorie)) return

    let actor = row.Charakter
    if (!actor) return
    actor = actor.replace(/\(.*\)/, '').trim().toUpperCase()
    if (BLACKLIST.includes(actor) || !actor) return

    const text = row['Text/Anweisung'] || ''
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length

    if (!actors[actor]) actors[actor] = { occurrences: 0, words: 0 }
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
