import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import DashboardClubAgency from '@/components/DashboardClubAgency'
import PlayerDashboard from '@/components/dashboard/PlayerDashboard'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import { getPlanLabel } from '@/lib/entitlements'
import { calculateClubProfileCompletion } from '@/lib/club-profile-completion'
import {
  calculateCoachProfileCompletion,
  calculateTalentProfileCompletion,
  getCoachCompletionMissingFields,
  getTalentCompletionMissingFields
} from '@/lib/profile-completion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role === 'admin') {
    redirect('/admin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      applications: {
        include: {
          opportunity: {
            include: {
              organization: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      talentProfile: {
        include: {
          interestNotifications: {
            include: {
              interestedUser: {
                select: {
                  name: true,
                  role: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      },
      coachProfile: true,
      clubAgencyProfile: true,
      opportunities: {
        include: {
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role === 'jugador' && !user.talentProfile) {
    redirect('/profile/complete')
  }

  if (user.role === 'entrenador' && !user.coachProfile) {
    redirect('/profile/complete')
  }

  if ((user.role === 'club' || user.role === 'agencia') && !user.clubAgencyProfile) {
    redirect('/profile/complete')
  }

  const isClubOrAgency = user.role === 'club' || user.role === 'agencia'
  const isPlayer = user.role === 'jugador'
  const isCoach = user.role === 'entrenador'

  const calculateProfileCompletion = () => {
    const missingItems: string[] = []
    let percentage = 0

    if (isPlayer) {
      if (user.talentProfile) {
        percentage = calculateTalentProfileCompletion({
          fullName: user.talentProfile.fullName,
          city: user.talentProfile.city,
          position: user.talentProfile.position,
          height: user.talentProfile.height,
          availabilityStatus: user.talentProfile.availabilityStatus
        })
        missingItems.push(
          ...getTalentCompletionMissingFields({
            fullName: user.talentProfile.fullName,
            city: user.talentProfile.city,
            position: user.talentProfile.position,
            height: user.talentProfile.height,
            availabilityStatus: user.talentProfile.availabilityStatus
          })
        )
      }
    } else if (isCoach) {
      if (user.coachProfile) {
        percentage = calculateCoachProfileCompletion({
          fullName: user.coachProfile.fullName,
          city: user.coachProfile.city,
          currentLevel: user.coachProfile.currentLevel,
          totalExperience: user.coachProfile.totalExperience,
          currentGoal: user.coachProfile.currentGoal,
          availability: user.coachProfile.availability
        })
        missingItems.push(
          ...getCoachCompletionMissingFields({
            fullName: user.coachProfile.fullName,
            city: user.coachProfile.city,
            currentLevel: user.coachProfile.currentLevel,
            totalExperience: user.coachProfile.totalExperience,
            currentGoal: user.coachProfile.currentGoal,
            availability: user.coachProfile.availability
          })
        )
      }
    } else if (isClubOrAgency && user.clubAgencyProfile) {
      percentage = calculateClubProfileCompletion({
        legalName: user.clubAgencyProfile.legalName,
        entityType: user.clubAgencyProfile.entityType,
        city: user.clubAgencyProfile.city,
        description: user.clubAgencyProfile.description,
        logo: user.clubAgencyProfile.logo
      })
      if (!user.clubAgencyProfile.legalName) missingItems.push('Nombre legal')
      if (!user.clubAgencyProfile.entityType) missingItems.push('Tipo de entidad')
      if (!user.clubAgencyProfile.city) missingItems.push('Ciudad')
      if (!user.clubAgencyProfile.description) missingItems.push('Descripción')
      if (!user.clubAgencyProfile.logo) missingItems.push('Logo')
      if (!user.clubAgencyProfile.slug) missingItems.push('URL pública del club')
    }

    return { percentage, missing: missingItems }
  }

  const profileCompletion = calculateProfileCompletion()

  const [playerRecommendations, coachRecommendations] = await Promise.all([
    isPlayer
      ? prisma.opportunity.findMany({
          where: {
            status: 'publicada',
            deadline: {
              gte: new Date()
            }
          },
          include: {
            organization: true
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        })
      : Promise.resolve([]),
    isCoach
      ? prisma.opportunity.findMany({
          where: {
            status: 'publicada',
            type: {
              in: ['empleo', 'prueba', 'clinica']
            },
            deadline: {
              gte: new Date()
            }
          },
          include: {
            organization: true
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        })
      : Promise.resolve([])
  ])

  const [clubLeadCounts, recentClubLeads, pendingInvitations, pendingShortlist, leadInboxItems, invitationInboxItems, shortlistInboxItems] = isClubOrAgency
    ? await Promise.all([
        prisma.clubLead.groupBy({
          by: ['status'],
          where: { clubUserId: user.id },
          _count: { _all: true }
        }),
        prisma.clubLead.findMany({
          where: { clubUserId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            fullName: true,
            status: true,
            email: true,
            createdAt: true
          }
        }),
        prisma.talentInvitation.count({
          where: {
            clubUserId: user.id,
            status: {
              in: ['SENT', 'VIEWED']
            }
          }
        }),
        prisma.talentShortlist.count({
          where: {
            clubUserId: user.id,
            status: {
              in: ['SAVED', 'CONTACTED']
            }
          }
        }),
        prisma.clubLead.findMany({
          where: {
            clubUserId: user.id,
            status: 'NEW'
          },
          orderBy: {
            createdAt: 'asc'
          },
          take: 8,
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true
          }
        }),
        prisma.talentInvitation.findMany({
          where: {
            clubUserId: user.id,
            status: {
              in: ['SENT', 'VIEWED']
            }
          },
          orderBy: {
            createdAt: 'asc'
          },
          take: 8,
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            talentProfileId: true,
            talentProfile: {
              select: {
                fullName: true
              }
            }
          }
        }),
        prisma.talentShortlist.findMany({
          where: {
            clubUserId: user.id,
            status: {
              in: ['SAVED', 'CONTACTED']
            }
          },
          orderBy: {
            updatedAt: 'asc'
          },
          take: 8,
          select: {
            talentProfileId: true,
            status: true,
            updatedAt: true,
            talentProfile: {
              select: {
                fullName: true
              }
            }
          }
        })
      ])
    : [[], [], 0, 0, [], [], []]

  const totalLeads = clubLeadCounts.reduce((acc, row) => acc + row._count._all, 0)
  const newLeads = clubLeadCounts.find((row) => row.status === 'NEW')?._count._all || 0

  const profileCtaHref = isClubOrAgency ? '/profile/club/edit' : '/profile/complete'
  const profileCtaLabel = isPlayer
    ? user.talentProfile
      ? 'Editar perfil jugador'
      : 'Completar perfil jugador'
    : isCoach
      ? user.coachProfile
        ? 'Editar perfil entrenador'
        : 'Completar perfil entrenador'
      : 'Completar perfil'

  const profileHint = isClubOrAgency
    ? 'Un perfil público completo mejora captación de jugadores y confianza del club.'
    : isPlayer
      ? 'Completa tu perfil para mejorar visibilidad ante clubes.'
      : 'Completa tu perfil profesional para mejorar opciones como entrenador.'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">¡Hola, {user.name || 'Usuario'}! 👋</h1>
              <p className="text-gray-600 mt-1">
                {isPlayer && 'Tu centro de control como jugador en WorkHoops'}
                {isCoach && 'Tu centro de control profesional como entrenador en WorkHoops'}
                {isClubOrAgency && 'Aquí tienes un resumen de tu actividad en WorkHoops'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-orange-50 text-workhoops-accent border-workhoops-accent">
                {getPlanLabel(user.planType, user.role)}
              </Badge>
              {(isPlayer || isCoach) && (
                <Link href={profileCtaHref}>
                  <Button variant="outline" className="border-workhoops-accent text-workhoops-accent hover:bg-orange-50">
                    <User className="w-4 h-4 mr-2" />
                    {profileCtaLabel}
                  </Button>
                </Link>
              )}
              <Link href={isClubOrAgency ? '/profile/club/edit' : '/profile'}>
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  {isClubOrAgency ? 'Perfil público' : 'Cuenta'}
                </Button>
              </Link>
            </div>
          </div>

          {profileCompletion.percentage < 100 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    {isClubOrAgency ? 'Completa tu página pública' : 'Completa tu perfil'} ({profileCompletion.percentage}%)
                  </h3>
                  <p className="text-sm text-yellow-700">{profileHint}</p>
                </div>
                <Link href={profileCtaHref}>
                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                    Completar
                  </Button>
                </Link>
              </div>
              <div className="mb-3 bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-workhoops-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion.percentage}%` }}
                />
              </div>
              {profileCompletion.missing.length > 0 && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className="text-xs font-medium text-yellow-800 mb-2">Pendiente de completar:</p>
                  <ul className="space-y-1">
                    {profileCompletion.missing.slice(0, 5).map((item, index) => (
                      <li key={index} className="text-xs text-yellow-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                    {profileCompletion.missing.length > 5 && (
                      <li className="text-xs text-yellow-600 italic">...y {profileCompletion.missing.length - 5} más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {isClubOrAgency && (
          <DashboardClubAgency
            userName={user.name || 'Usuario'}
            opportunities={user.opportunities}
            totalApplications={user.opportunities.reduce((sum, opp) => sum + opp._count.applications, 0)}
            totalLeads={totalLeads}
            newLeads={newLeads}
            pendingInvitations={pendingInvitations}
            pendingShortlist={pendingShortlist}
            recentLeads={recentClubLeads.map((lead) => ({
              ...lead,
              createdAt: lead.createdAt.toISOString()
            }))}
            leadInboxItems={leadInboxItems.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString()
            }))}
            invitationInboxItems={invitationInboxItems.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString()
            }))}
            shortlistInboxItems={shortlistInboxItems.map((item) => ({
              ...item,
              updatedAt: item.updatedAt.toISOString()
            }))}
          />
        )}

        {isPlayer && (
          <PlayerDashboard
            applications={user.applications}
            recommendations={playerRecommendations}
            interestNotifications={user.talentProfile?.interestNotifications || []}
          />
        )}

        {isCoach && (
          <CoachDashboard
            applications={user.applications}
            recommendations={coachRecommendations}
            coachProfile={
              user.coachProfile
                ? {
                    currentGoal: user.coachProfile.currentGoal,
                    availability: user.coachProfile.availability,
                    currentLevel: user.coachProfile.currentLevel
                  }
                : null
            }
          />
        )}
      </div>
    </div>
  )
}
