import { NextRequest, NextResponse } from 'next/server'

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

// Fix mojibake: UTF-8 bytes that were incorrectly decoded as Latin-1
function fixEncoding(text: string): string {
  try {
    // Check if string contains mojibake patterns (UTF-8 decoded as Latin-1)
    // Common patterns: Ã¤ → ä, Ã¶ → ö, Ã¼ → ü, ÃŸ → ß
    // Ã is \xC3, followed by characters in range \x80-\xBF for 2-byte UTF-8
    if (/\xC3[\x80-\xBF]/.test(text)) {
      // Convert string to Latin-1 bytes, then decode as UTF-8
      const bytes = new Uint8Array(text.length)
      for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i) & 0xff
      }
      return new TextDecoder('utf-8').decode(bytes)
    }
    return text
  } catch {
    return text // Return original if decoding fails
  }
}

// Recursively fix encoding in all string values of an object
function fixObjectEncoding<T>(obj: T): T {
  if (typeof obj === 'string') {
    return fixEncoding(obj) as T
  }
  if (Array.isArray(obj)) {
    return obj.map(fixObjectEncoding) as T
  }
  if (obj && typeof obj === 'object') {
    const fixed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      fixed[key] = fixObjectEncoding(value)
    }
    return fixed as T
  }
  return obj
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string }> }
) {
  try {
    const { playId } = await params

    // Fetch script data from Flask backend
    const scriptResponse = await fetch(`${FLASK_BACKEND_URL}/api/script/${playId}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
      },
      cache: 'no-store',
    })

    if (!scriptResponse.ok) {
      const errorText = await scriptResponse.text()
      return NextResponse.json(
        { error: `Failed to fetch script: ${scriptResponse.statusText}`, details: errorText },
        { status: scriptResponse.status }
      )
    }

    // Flask returns array of script rows directly
    // Fix any encoding issues from the backend
    const rawData = await scriptResponse.json()
    const scriptData = fixObjectEncoding(rawData)

    // Extract unique actors from script data
    const actorsMap = new Map<string, { role: string; name: string }>()
    if (Array.isArray(scriptData)) {
      scriptData.forEach((row: Record<string, string>) => {
        const character = row.Charakter
        if (character && !actorsMap.has(character)) {
          actorsMap.set(character, {
            role: character,
            name: '', // Actor names would come from a separate source if available
          })
        }
      })
    }

    // Return in the format expected by the frontend
    return NextResponse.json({
      script: Array.isArray(scriptData) ? scriptData : [],
      actors: Array.from(actorsMap.values()),
    })
  } catch (error) {
    console.error('Error fetching script:', error)
    return NextResponse.json(
      { error: 'Failed to fetch script data', details: String(error) },
      { status: 500 }
    )
  }
}
