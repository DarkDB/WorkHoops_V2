import { NextRequest } from 'next/server'
import { professionalProfiles, professionalRequest } from '@/lib/professional-profile-api'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  return professionalRequest(actor => professionalProfiles.list(actor, request.nextUrl.searchParams.get('profileId') || undefined))
}
export async function POST(request: NextRequest) {
  return professionalRequest(async actor => professionalProfiles.create(actor, await request.json(), request.nextUrl.searchParams.get('profileId') || undefined), 201)
}
