'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, MapPin, Briefcase, Star, Award, CheckCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/Navbar'

interface Club {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  planType: string
  verified: boolean
  profile: {
    legalName: string
    entityType: string
    city: string
    description: string | null
    logo: string | null
    profileCompletionPercentage: number
  }
  opportunitiesCount: number
  hasFeaturedOpportunities: boolean
}

export default function ClubesPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('all')

  useEffect(() => {
    fetchClubs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [cityFilter, entityTypeFilter, clubs])

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs/list')
      const data = await response.json()
      setClubs(data.clubs || [])
      setFilteredClubs(data.clubs || [])
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...clubs]

    if (cityFilter) {
      filtered = filtered.filter(club => 
        club.profile.city.toLowerCase().includes(cityFilter.toLowerCase())
      )
    }

    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter(club => 
        club.profile.entityType === entityTypeFilter
      )
    }

    setFilteredClubs(filtered)
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'club_deportivo': 'Club Deportivo',
      'agencia_representacion': 'Agencia de Representación',
      'federacion': 'Federación',
      'academia': 'Academia/Escuela',
      'empresa': 'Empresa'
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-12 lg:py-16 bg-gradient-to-br from-workhoops-primary to-workhoops-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Building2 className="w-4 h-4" />
              <span>Red de Clubes y Agencias</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black mb-4">
              Descubre Clubes y Agencias
            </h1>
            
            <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
              Conecta con organizaciones deportivas que buscan talento como el tuyo
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por ciudad..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="club_deportivo">Club Deportivo</SelectItem>
                <SelectItem value="agencia_representacion">Agencia de Representación</SelectItem>
                <SelectItem value="federacion">Federación</SelectItem>
                <SelectItem value="academia">Academia/Escuela</SelectItem>
                <SelectItem value="empresa">Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredClubs.length} de {clubs.length} clubes y agencias
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-workhoops-accent mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando clubes...</p>
            </div>
          ) : filteredClubs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron clubes
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <Link key={club.id} href={`/clubes/${club.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {club.profile.logo ? (
                            <img 
                              src={club.profile.logo} 
                              alt={club.profile.legalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          {club.planType === 'destacado' && (
                            <Badge className="bg-workhoops-accent">
                              <Star className="w-3 h-3 mr-1" />
                              Destacado
                            </Badge>
                          )}
                          {club.verified && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl mb-2">
                        {club.profile.legalName}
                      </CardTitle>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {club.profile.city}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-2" />
                          {getEntityTypeLabel(club.profile.entityType)}
                        </div>
                        
                        {club.opportunitiesCount > 0 && (
                          <div className="flex items-center text-sm">
                            <Briefcase className="w-4 h-4 mr-2 text-workhoops-accent" />
                            <span className="font-medium text-workhoops-accent">
                              {club.opportunitiesCount} {club.opportunitiesCount === 1 ? 'oferta activa' : 'ofertas activas'}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {club.profile.description ? (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {club.profile.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Sin descripción disponible
                        </p>
                      )}
                      
                      <Button variant="outline" className="w-full mt-4">
                        Ver perfil completo
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-workhoops-primary to-workhoops-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            ¿Eres un club o agencia?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Crea tu perfil y conecta con jugadores y entrenadores profesionales
          </p>
          <Link href="/auth/register?role=club">
            <Button size="lg" variant="secondary">
              Registrar mi club
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
