import { NextRequest } from 'next/server'
import { professionalProfiles, professionalRequest } from '@/lib/professional-profile-api'
export const dynamic = 'force-dynamic'
export async function PATCH(request: NextRequest, { params }: { params: { entryId: string } }) {
  return professionalRequest(async actor => professionalProfiles.update(actor, params.entryId, await request.json()))
}
export async function DELETE(_request: NextRequest, { params }: { params: { entryId: string } }) {
  return professionalRequest(async actor => {
    await professionalProfiles.remove(actor, params.entryId)
    return { success: true }
  })
}
