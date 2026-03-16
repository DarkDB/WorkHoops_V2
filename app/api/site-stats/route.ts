import { NextResponse } from 'next/server'
import { getSiteStats } from '@/lib/site-stats'

export const revalidate = 300

export async function GET() {
  try {
    const stats = await getSiteStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching site stats:', error)
    return NextResponse.json(
      { error: 'No se pudieron cargar las estadisticas del sitio' },
      { status: 500 }
    )
  }
}
