'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  Calendar,
  Briefcase,
  Search,
  Filter,
  Eye,
  Send
} from 'lucide-react'

interface TalentProfile {
  id: string
  fullName: string
  role: string
  position: string | null
  bio: string | null
  height: number | null
  weight: number | null
  videoUrl: string | null
  socialUrl: string | null
  city: string
  birthDate: string
}

interface Application {
  id: string
  state: string
  message: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    createdAt: string
    talentProfile: TalentProfile | null
  }
}

interface Opportunity {
  id: string
  title: string
  slug: string
  type: string
  level: string
  city: string
  applications: Application[]
}

interface CandidatesManagerProps {
  opportunity: Opportunity
}

export default function CandidatesManager({ opportunity: initialOpportunity }: CandidatesManagerProps) {
  const [opportunity, setOpportunity] = useState(initialOpportunity)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filtrar candidatos
  const filteredApplications = opportunity.applications.filter(app => {
    const matchesSearch = 
      app.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.state === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceptada':
        return 'bg-green-100 text-green-800'
      case 'en_revision':
        return 'bg-blue-100 text-blue-800'
      case 'rechazada':
        return 'bg-red-100 text-red-800'
      case 'enviada':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      enviada: 'Enviada',
      en_revision: 'En Revisión',
      aceptada: 'Aceptada',
      rechazada: 'Rechazada'
    }
    return labels[status] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aceptada':
        return <CheckCircle className="w-4 h-4" />
      case 'rechazada':
        return <XCircle className="w-4 h-4" />
      case 'en_revision':
        return <Clock className="w-4 h-4" />
      default:
        return <Send className="w-4 h-4" />
    }
  }

  const handleUpdateStatus = async (applicationId: string, newState: string) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state: newState })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      // Actualizar estado local
      setOpportunity(prev => ({
        ...prev,
        applications: prev.applications.map(app =>
          app.id === applicationId ? { ...app, state: newState } : app
        )
      }))

      toast.success('Estado actualizado', {
        description: `La solicitud ha sido marcada como ${getStatusLabel(newState)}`
      })
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al actualizar el estado'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const stats = {
    total: opportunity.applications.length,
    enviada: opportunity.applications.filter(a => a.state === 'enviada').length,
    en_revision: opportunity.applications.filter(a => a.state === 'en_revision').length,
    aceptada: opportunity.applications.filter(a => a.state === 'aceptada').length,
    rechazada: opportunity.applications.filter(a => a.state === 'rechazada').length
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="w-8 h-8 mr-3 text-workhoops-accent" />
          Candidatos
        </h1>
        <p className="text-gray-600 mt-2">
          {opportunity.title} - {opportunity.city}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Nuevas</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.enviada}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">En Revisión</p>
            <p className="text-2xl font-bold text-blue-600">{stats.en_revision}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Aceptadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.aceptada}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Rechazadas</p>
            <p className="text-2xl font-bold text-red-600">{stats.rechazada}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
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
                  <SelectItem value="enviada">Nuevas</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="aceptada">Aceptadas</SelectItem>
                  <SelectItem value="rechazada">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de candidatos */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                {opportunity.applications.length === 0 
                  ? 'Aún no hay candidatos' 
                  : 'No se encontraron candidatos con estos filtros'}
              </p>
              <p className="text-sm">
                {opportunity.applications.length === 0 
                  ? 'Cuando alguien aplique a esta oferta, aparecerá aquí.'
                  : 'Intenta ajustar los filtros de búsqueda.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div 
                  key={application.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={application.user.image || undefined} />
                        <AvatarFallback>
                          {application.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {application.user.name || 'Sin nombre'}
                          </h3>
                          <Badge className={getStatusColor(application.state)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(application.state)}
                              <span className="ml-1">{getStatusLabel(application.state)}</span>
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {application.user.email}
                          </div>
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {application.user.role}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(application.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </div>

                        {application.user.talentProfile && (
                          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md inline-block">
                            <Briefcase className="w-3 h-3 inline mr-1" />
                            {application.user.talentProfile.role}
                            {application.user.talentProfile.position && ` - ${application.user.talentProfile.position}`}
                          </div>
                        )}

                        {application.message && (
                          <div className="mt-2 text-sm text-gray-700 italic bg-gray-50 p-2 rounded">
                            "{application.message}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCandidate(application)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver perfil
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Perfil del Candidato</DialogTitle>
                            <DialogDescription>
                              Información completa del candidato
                            </DialogDescription>
                          </DialogHeader>
                          {selectedCandidate && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={selectedCandidate.user.image || undefined} />
                                  <AvatarFallback className="text-2xl">
                                    {selectedCandidate.user.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-bold">{selectedCandidate.user.name}</h3>
                                  <p className="text-gray-600">{selectedCandidate.user.email}</p>
                                  <Badge className="mt-1">{selectedCandidate.user.role}</Badge>
                                </div>
                              </div>

                              {selectedCandidate.user.talentProfile ? (
                                <div className="space-y-3">
                                  <div className="border-t pt-3">
                                    <h4 className="font-semibold mb-2">Información Deportiva</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <p className="text-gray-600">Rol:</p>
                                        <p className="font-medium">{selectedCandidate.user.talentProfile.role}</p>
                                      </div>
                                      {selectedCandidate.user.talentProfile.position && (
                                        <div>
                                          <p className="text-gray-600">Posición:</p>
                                          <p className="font-medium">{selectedCandidate.user.talentProfile.position}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-gray-600">Ciudad:</p>
                                        <p className="font-medium">{selectedCandidate.user.talentProfile.city}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Edad:</p>
                                        <p className="font-medium">
                                          {new Date().getFullYear() - new Date(selectedCandidate.user.talentProfile.birthDate).getFullYear()} años
                                        </p>
                                      </div>
                                      {selectedCandidate.user.talentProfile.height && (
                                        <div>
                                          <p className="text-gray-600">Altura:</p>
                                          <p className="font-medium">{selectedCandidate.user.talentProfile.height} cm</p>
                                        </div>
                                      )}
                                      {selectedCandidate.user.talentProfile.weight && (
                                        <div>
                                          <p className="text-gray-600">Peso:</p>
                                          <p className="font-medium">{selectedCandidate.user.talentProfile.weight} kg</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {selectedCandidate.user.talentProfile.bio && (
                                    <div className="border-t pt-3">
                                      <h4 className="font-semibold mb-2">Biografía</h4>
                                      <p className="text-sm text-gray-700">{selectedCandidate.user.talentProfile.bio}</p>
                                    </div>
                                  )}

                                  {(selectedCandidate.user.talentProfile.videoUrl || selectedCandidate.user.talentProfile.socialUrl) && (
                                    <div className="border-t pt-3">
                                      <h4 className="font-semibold mb-2">Enlaces</h4>
                                      <div className="space-y-2">
                                        {selectedCandidate.user.talentProfile.videoUrl && (
                                          <a 
                                            href={selectedCandidate.user.talentProfile.videoUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline block"
                                          >
                                            📹 Video destacado
                                          </a>
                                        )}
                                        {selectedCandidate.user.talentProfile.socialUrl && (
                                          <a 
                                            href={selectedCandidate.user.talentProfile.socialUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline block"
                                          >
                                            🔗 Redes sociales
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <div className="border-t pt-3">
                                    <Link href={`/talento/perfiles/${selectedCandidate.user.talentProfile.id}`} target="_blank">
                                      <Button variant="outline" className="w-full">
                                        Ver perfil completo
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                  <p>Este usuario no ha completado su perfil de talento</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {application.state !== 'aceptada' && application.state !== 'rechazada' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateStatus(application.id, 'aceptada')}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(application.id, 'rechazada')}
                            disabled={isUpdating}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {application.state === 'enviada' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(application.id, 'en_revision')}
                          disabled={isUpdating}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Revisar
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
