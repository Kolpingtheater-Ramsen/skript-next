import { NextRequest, NextResponse } from 'next/server'

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string }> }
) {
  try {
    const { playId } = await params

    // Proxy to Flask backend
    const response = await fetch(`${FLASK_BACKEND_URL}/api/script/${playId}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Don't cache in development
      cache: process.env.NODE_ENV === 'production' ? 'default' : 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch script: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching script:', error)
    return NextResponse.json(
      { error: 'Failed to fetch script data' },
      { status: 500 }
    )
  }
}
