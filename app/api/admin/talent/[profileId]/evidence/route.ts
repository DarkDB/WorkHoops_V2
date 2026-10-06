import { NextRequest } from 'next/server'
import { professionalProfiles, professionalRequest } from '@/lib/professional-profile-api'
export const dynamic = 'force-dynamic'
export async function PATCH(request: NextRequest, { params }: { params: { profileId: string } }) {
  return professionalRequest(async actor => professionalProfiles.review(actor, params.profileId, await request.json()))
}
