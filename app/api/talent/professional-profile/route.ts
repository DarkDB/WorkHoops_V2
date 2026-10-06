import { NextRequest } from 'next/server'
import { professionalProfiles, professionalRequest } from '@/lib/professional-profile-api'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  return professionalRequest(actor => professionalProfiles.getStatus(actor, request.nextUrl.searchParams.get('profileId') || undefined))
}
export async function PATCH(request: NextRequest) {
  return professionalRequest(async actor => professionalProfiles.updateStatus(actor, await request.json(), request.nextUrl.searchParams.get('profileId') || undefined))
}
