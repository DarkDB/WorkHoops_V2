import { NextResponse } from 'next/server'
import logger from '@/lib/logger'
import { getSiteStats } from '@/lib/site-stats'

export const revalidate = 300

export async function GET() {
  try {
    const stats = await getSiteStats()
    return NextResponse.json(stats)
  } catch (error) {
    logger.error({ err: error }, 'Error fetching site stats')
    return NextResponse.json(
      { error: 'No se pudieron cargar las estadisticas del sitio' },
      { status: 500 }
    )
  }
}
