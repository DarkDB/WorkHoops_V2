'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Briefcase,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  slug: string
  type: string
  level: string
  city: string
  status: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
    role: string
  }
  organization: {
    id: string
    name: string
    logo: string | null
  } | null
  _count: {
    applications: number
  }
}

interface AdminOpportunitiesManagerProps {
  opportunities: Opportunity[]
}

export default function AdminOpportunitiesManager({ opportunities: initialOpportunities }: AdminOpportunitiesManagerProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState<string | null>(null)

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.author.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (opportunityId: string, slug: string, newStatus: string) => {
    setLoading(opportunityId)

    try {
      const response = await fetch(`/api/admin/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      // Update local state
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId ? { ...opp, status: newStatus } : opp
      ))

      toast.success('¡Actualizado!', {
        description: `La oferta ha sido ${newStatus === 'publicada' ? 'aprobada' : 'rechazada'}`
      })
    } catch (error) {
      console.error('Error updating opportunity:', error)
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al actualizar la oferta'
      })
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicada':
        return 'bg-green-100 text-green-800'
      case 'borrador':
        return 'bg-yellow-100 text-yellow-800'
      case 'cerrada':
        return 'bg-red-100 text-red-800'
      case 'rechazada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      publicada: 'Publicada',
      borrador: 'Borrador',
      cerrada: 'Cerrada',
      rechazada: 'Rechazada'
    }
    return labels[status] || status
  }

  const stats = {
    total: opportunities.length,
    publicada: opportunities.filter(o => o.status === 'publicada').length,
    borrador: opportunities.filter(o => o.status === 'borrador').length,
    cerrada: opportunities.filter(o => o.status === 'cerrada').length
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al panel
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Briefcase className="w-8 h-8 mr-3 text-workhoops-accent" />
          Gestión de Ofertas
        </h1>
        <p className="text-gray-600 mt-2">Revisa y administra todas las oportunidades publicadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Publicadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.publicada}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Borradores</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.borrador}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Cerradas</p>
            <p className="text-2xl font-bold text-red-600">{stats.cerrada}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por título, ciudad o autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="publicada">Publicadas</SelectItem>
                  <SelectItem value="borrador">Borradores</SelectItem>
                  <SelectItem value="cerrada">Cerradas</SelectItem>
                  <SelectItem value="rechazada">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <Card>
        <CardHeader>
          <CardTitle>Ofertas ({filteredOpportunities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron ofertas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
                        <Badge className={getStatusColor(opportunity.status)}>
                          {getStatusLabel(opportunity.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {opportunity.city}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {opportunity.author.name} ({opportunity.author.role})
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(opportunity.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      {opportunity.organization && (
                        <div className="mt-2 text-sm text-gray-500">
                          Organización: {opportunity.organization.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      {opportunity._count.applications} candidato{opportunity._count.applications !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/oportunidades/${opportunity.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      {opportunity.status === 'borrador' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateStatus(opportunity.id, opportunity.slug, 'publicada')}
                            disabled={loading === opportunity.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(opportunity.id, opportunity.slug, 'rechazada')}
                            disabled={loading === opportunity.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      {opportunity.status === 'publicada' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleUpdateStatus(opportunity.id, opportunity.slug, 'cerrada')}
                          disabled={loading === opportunity.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cerrar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
