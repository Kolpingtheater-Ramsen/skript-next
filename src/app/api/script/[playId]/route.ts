import { NextRequest, NextResponse } from 'next/server'

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

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
    const scriptData = await scriptResponse.json()

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
