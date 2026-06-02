import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  secondaryActionLabel?: string
  secondaryActionHref?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="mb-6 rounded-full bg-gray-100 p-6">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 max-w-md mb-8">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {actionLabel && actionHref && (
            <Link href={actionHref}>
              <Button size="lg">{actionLabel}</Button>
            </Link>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Link href={secondaryActionHref}>
              <Button size="lg" variant="outline">
                {secondaryActionLabel}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
