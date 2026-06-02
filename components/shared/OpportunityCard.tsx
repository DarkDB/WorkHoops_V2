'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOpportunityTypeLabel, getOpportunityTypeColor, formatRelativeTime } from '@/lib/utils'

interface OpportunityCardProps {
  opportunity: {
    id: string
    slug: string
    title: string
    type: string
    city: string
    verified: boolean
    deadline: Date | null
    organization: {
      name: string
      logo: string | null
      verified: boolean
    } | null
  }
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { data: session } = useSession()
  const router = useRouter()

  function handleVerDetalles() {
    if (!session) {
      router.push(`/auth/register?redirect=/oportunidades/${opportunity.slug}`)
    } else {
      router.push(`/oportunidades/${opportunity.slug}`)
    }
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <Badge className={getOpportunityTypeColor(opportunity.type)}>
            {getOpportunityTypeLabel(opportunity.type)}
          </Badge>
          {opportunity.verified && (
            <CheckCircle className="w-4 h-4 text-green-500 badge-pulse" />
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">
          {opportunity.title}
        </CardTitle>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          {opportunity.organization?.logo && (
            <div className="image-zoom w-4 h-4 rounded-full overflow-hidden">
              <Image
                src={opportunity.organization.logo}
                alt={opportunity.organization.name}
                width={16}
                height={16}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <span>{opportunity.organization?.name || 'Organizador individual'}</span>
          {opportunity.organization?.verified && (
            <CheckCircle className="w-3 h-3 text-blue-500" />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-500">
            📍 {opportunity.city}
          </div>
          {opportunity.deadline && (
            <div className="text-sm text-orange-600">
              ⏰ {formatRelativeTime(opportunity.deadline)}
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={handleVerDetalles}>
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  )
}
