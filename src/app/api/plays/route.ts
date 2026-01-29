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
