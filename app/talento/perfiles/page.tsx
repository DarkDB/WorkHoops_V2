'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  User, 
  Trophy, 
  CheckCircle,
  Loader2,
  Filter
} from 'lucide-react'

interface TalentProfile {
  id: string
  fullName: string
  role: string
  city: string
  country: string
  position: string | null
  height: number | null
  weight: number | null
  bio: string | null
  verified: boolean
  createdAt: string
  user: {
    id: string
    image: string | null
    planType: string
  }
}

export default function PerfilesPage() {
  const [profiles, setProfiles] = useState<TalentProfile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<TalentProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    filterProfiles()
  }, [searchTerm, roleFilter, cityFilter, profiles])

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/talent/list')
      const data = await response.json()
      setProfiles(data.profiles || [])
      setFilteredProfiles(data.profiles || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProfiles = () => {
    let filtered = [...profiles]

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(p => p.role === roleFilter)
    }

    // Filter by city
    if (cityFilter) {
      filtered = filtered.filter(p => 
        p.city.toLowerCase().includes(cityFilter.toLowerCase())
      )
    }

    setFilteredProfiles(filtered)
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      jugador: 'Jugador',
      entrenador: 'Entrenador',
      staff: 'Staff Técnico'
    }
    return labels[role] || role
  }

  const getPositionLabel = (position: string | null) => {
    if (!position) return null
    const labels: Record<string, string> = {
      base: 'Base',
      escolta: 'Escolta',
      alero: 'Alero',
      'ala-pivot': 'Ala-Pívot',
      pivot: 'Pívot'
    }
    return labels[position] || position
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-workhoops-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Perfiles de Talento
          </h1>
          <p className="text-gray-600">
            Descubre jugadores, entrenadores y profesionales del baloncesto
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="jugador">Jugadores</SelectItem>
                  <SelectItem value="entrenador">Entrenadores</SelectItem>
                  <SelectItem value="staff">Staff Técnico</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Filtrar por ciudad..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredProfiles.length} perfiles encontrados
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('all')
                  setCityFilter('')
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron perfiles
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta ajustar los filtros de búsqueda
              </p>
              <Link href="/talento#formulario">
                <Button>
                  <Trophy className="w-4 h-4 mr-2" />
                  Crear mi perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-workhoops-accent to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-1">
                          <span>{profile.fullName}</span>
                          {profile.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {getRoleLabel(profile.role)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {profile.position && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Posición:</strong> {getPositionLabel(profile.position)}
                    </p>
                  )}

                  {profile.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.city}, {profile.country}
                  </div>

                  {(profile.height || profile.weight) && (
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                      {profile.height && <span>Altura: {profile.height} cm</span>}
                      {profile.weight && <span>Peso: {profile.weight} kg</span>}
                    </div>
                  )}

                  <Link href={`/talento/perfiles/${profile.id}`}>
                    <Button className="w-full" size="sm">
                      Ver perfil completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-workhoops-accent to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              ¿Quieres aparecer aquí?
            </h2>
            <p className="mb-6 text-orange-100">
              Crea tu perfil de talento y sé descubierto por clubs y agencias
            </p>
            <Link href="/talento#formulario">
              <Button variant="secondary" size="lg">
                Crear mi perfil gratis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
