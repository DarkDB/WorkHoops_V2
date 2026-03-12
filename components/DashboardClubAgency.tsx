'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Users,
  FileText,
  PlusCircle,
  Calendar,
  MapPin,
  Bookmark,
  Inbox,
  Mail
} from 'lucide-react'

type LeadStatus = 'NEW' | 'REVIEWED' | 'CONTACTED' | 'REJECTED'

interface Opportunity {
  id: string
  title: string
  slug: string
  type: string
  city: string
  status: string
  createdAt: Date
  deadline: Date | null
  _count: {
    applications: number
  }
}

interface RecentLead {
  id: string
  fullName: string
  status: LeadStatus
  email: string
  createdAt: string
}

interface DashboardClubAgencyProps {
  userName: string
  opportunities: Opportunity[]
  totalApplications: number
  totalLeads: number
  newLeads: number
  pendingInvitations: number
  pendingShortlist: number
  recentLeads: RecentLead[]
}

const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: 'Nuevo',
  REVIEWED: 'Revisado',
  CONTACTED: 'Contactado',
  REJECTED: 'Rechazado'
}

const leadStatusClass: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  REVIEWED: 'bg-yellow-100 text-yellow-800',
  CONTACTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-gray-100 text-gray-700'
}

export default function DashboardClubAgency({
  opportunities,
  totalApplications,
  totalLeads,
  newLeads,
  pendingInvitations,
  pendingShortlist,
  recentLeads
}: DashboardClubAgencyProps) {
  const activeOpportunities = opportunities.filter((opp) => opp.status === 'publicada').length
  const draftOpportunities = opportunities.filter((opp) => opp.status === 'borrador').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicada':
        return 'bg-green-100 text-green-800'
      case 'borrador':
        return 'bg-gray-100 text-gray-800'
      case 'cerrada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      publicada: 'Publicada',
      borrador: 'Borrador',
      cerrada: 'Cerrada'
    }
    return labels[status] || status
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'empleo':
        return <Briefcase className="w-4 h-4" />
      case 'prueba':
        return <Users className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ofertas activas</p>
                <p className="text-3xl font-bold text-gray-900">{activeOpportunities}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">{draftOpportunities} en borrador</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidaturas</p>
                <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Desde ofertas publicadas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads nuevos</p>
                <p className="text-3xl font-bold text-gray-900">{newLeads}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Inbox className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Pendientes de revisión</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads totales</p>
                <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Formulario “Quiero jugar”</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Mis ofertas</span>
                </CardTitle>
                <Link href="/publicar">
                  <Button size="sm" className="bg-workhoops-accent hover:bg-orange-600">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Nueva oferta
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aún no has publicado ninguna oferta</p>
                    <Link href="/publicar">
                      <Button variant="outline" size="sm" className="mt-4">
                        Publicar primera oferta
                      </Button>
                    </Link>
                  </div>
                ) : (
                  opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          {getTypeIcon(opportunity.type)}
                          <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                        </div>
                        <Badge className={getStatusColor(opportunity.status)}>{getStatusLabel(opportunity.status)}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {opportunity.city}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Publicado el {new Date(opportunity.createdAt).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/candidatos/${opportunity.id}`}>
                            <Button
                              variant={opportunity._count.applications > 0 ? 'default' : 'ghost'}
                              size="sm"
                              className={opportunity._count.applications > 0 ? 'bg-workhoops-accent hover:bg-orange-600' : ''}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              {opportunity._count.applications} candidato{opportunity._count.applications !== 1 ? 's' : ''}
                            </Button>
                          </Link>
                          <Link href={`/oportunidades/${opportunity.slug}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                          <Link href={`/oportunidades/${opportunity.slug}/edit`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inbox de reclutamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Leads nuevos</p>
                  <p className="text-xs text-gray-500">Jugadores que enviaron “Quiero jugar”</p>
                </div>
                <Link href="/dashboard/leads">
                  <Button size="sm" variant={newLeads > 0 ? 'default' : 'outline'} className={newLeads > 0 ? 'bg-workhoops-accent hover:bg-orange-600' : ''}>
                    {newLeads}
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Invitaciones pendientes</p>
                  <p className="text-xs text-gray-500">Sin respuesta del jugador</p>
                </div>
                <Link href="/dashboard/shortlist">
                  <Button size="sm" variant={pendingInvitations > 0 ? 'default' : 'outline'} className={pendingInvitations > 0 ? 'bg-workhoops-accent hover:bg-orange-600' : ''}>
                    {pendingInvitations}
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Shortlist por trabajar</p>
                  <p className="text-xs text-gray-500">Perfiles guardados/contactados</p>
                </div>
                <Link href="/dashboard/shortlist">
                  <Button size="sm" variant={pendingShortlist > 0 ? 'default' : 'outline'} className={pendingShortlist > 0 ? 'bg-workhoops-accent hover:bg-orange-600' : ''}>
                    {pendingShortlist}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Jugadores interesados recientes</CardTitle>
                <Link href="/dashboard/leads">
                  <Button variant="ghost" size="sm">Ver todos</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-sm text-gray-500">Aún no has recibido leads desde tu página pública.</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-gray-900">{lead.fullName}</p>
                        <Badge className={leadStatusClass[lead.status]}>{leadStatusLabel[lead.status]}</Badge>
                      </div>
                      <a href={`mailto:${lead.email}`} className="text-xs text-workhoops-accent hover:underline mt-1 inline-block">
                        {lead.email}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/publicar" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Publicar nueva oferta
                </Button>
              </Link>
              <Link href="/talento/perfiles" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Buscar talento
                </Button>
              </Link>
              <Link href="/dashboard/shortlist" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Ver shortlist
                </Button>
              </Link>
              <Link href="/dashboard/leads" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Inbox className="w-4 h-4 mr-2" />
                  Jugadores interesados
                </Button>
              </Link>
              <Link href="/profile/club/edit" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Editar página pública
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
