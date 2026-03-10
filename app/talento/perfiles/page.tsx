'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/EmptyState'
import ClubRecruitmentActions from '@/components/talent/ClubRecruitmentActions'
import {
  Search,
  MapPin,
  Trophy,
  CheckCircle,
  Loader2,
  Filter,
  Users,
  Ruler,
  Calendar
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
  availabilityStatus: 'AVAILABLE' | 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE' | null
  availableFrom: string | null
  birthDate: string | null
  currentLevel: string | null
  createdAt: string
  user: {
    id: string
    image: string | null
    planType: string
  }
}

type PipelineStatus = 'SAVED' | 'CONTACTED' | 'INVITED' | 'SIGNED' | 'REJECTED'

export default function PerfilesPage() {
  const { data: session } = useSession()
  const [profiles, setProfiles] = useState<TalentProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [minHeight, setMinHeight] = useState('')
  const [maxHeight, setMaxHeight] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [shortlistMap, setShortlistMap] = useState<Record<string, { status: PipelineStatus }>>({})

  const isClubOrAgency = session?.user?.role === 'club' || session?.user?.role === 'agencia'

  useEffect(() => {
    if (!isClubOrAgency) {
      setShortlistMap({})
      return
    }

    const fetchShortlist = async () => {
      try {
        const response = await fetch('/api/talent/shortlist')
        const data = await response.json()
        if (!response.ok) return

        const next: Record<string, { status: PipelineStatus }> = {}
        for (const item of data.items || []) {
          next[item.talentProfileId] = { status: item.status }
        }
        setShortlistMap(next)
      } catch (error) {
        console.error('Error fetching shortlist:', error)
      }
    }

    fetchShortlist()
  }, [isClubOrAgency])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProfiles()
    }, 250)

    return () => clearTimeout(timeout)
  }, [
    searchTerm,
    roleFilter,
    cityFilter,
    positionFilter,
    levelFilter,
    availabilityFilter,
    availableOnly,
    minHeight,
    maxHeight,
    minAge,
    maxAge,
    isClubOrAgency
  ])

  const fetchProfiles = async () => {
    try {
      setIsLoading(true)
      const query = new URLSearchParams()
      if (searchTerm.trim()) query.set('search', searchTerm.trim())
      if (roleFilter !== 'all') query.set('role', roleFilter)
      if (cityFilter.trim()) query.set('city', cityFilter.trim())
      if (positionFilter !== 'all') query.set('position', positionFilter)
      if (levelFilter.trim()) query.set('level', levelFilter.trim())
      if (availabilityFilter !== 'all') query.set('availabilityStatus', availabilityFilter)
      if (isClubOrAgency && availableOnly) query.set('availableOnly', 'true')
      if (minHeight) query.set('minHeight', minHeight)
      if (maxHeight) query.set('maxHeight', maxHeight)
      if (minAge) query.set('minAge', minAge)
      if (maxAge) query.set('maxAge', maxAge)

      const response = await fetch(`/api/talent/list${query.toString() ? `?${query.toString()}` : ''}`)
      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
      setProfiles([])
    } finally {
      setIsLoading(false)
    }
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

  const getAvailabilityBadge = (status: TalentProfile['availabilityStatus']) => {
    if (status === 'AVAILABLE') {
      return <Badge className="bg-green-100 text-green-800">Disponible</Badge>
    }
    if (status === 'OPEN_TO_OFFERS') {
      return <Badge className="bg-blue-100 text-blue-800">Abierto a ofertas</Badge>
    }
    if (status === 'NOT_AVAILABLE') {
      return <Badge className="bg-gray-100 text-gray-700">No disponible</Badge>
    }
    return null
  }

  const formatAvailableFrom = (date: string | null) => {
    if (!date) return null
    try {
      return new Date(date).toLocaleDateString('es-ES')
    } catch {
      return null
    }
  }

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfiles de Talento</h1>
          <p className="text-gray-600">
            Descubre jugadores, entrenadores y profesionales del baloncesto
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
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
                </SelectContent>
              </Select>

              <Input
                placeholder="Ciudad"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Posición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las posiciones</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="escolta">Escolta</SelectItem>
                  <SelectItem value="alero">Alero</SelectItem>
                  <SelectItem value="ala-pivot">Ala-Pívot</SelectItem>
                  <SelectItem value="pivot">Pívot</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Nivel (ej: semiprofesional)"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              />

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier disponibilidad</SelectItem>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="OPEN_TO_OFFERS">Abierto a ofertas</SelectItem>
                  <SelectItem value="NOT_AVAILABLE">No disponible</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="120"
                  max="250"
                  placeholder="Alt. min"
                  value={minHeight}
                  onChange={(e) => setMinHeight(e.target.value)}
                />
                <Input
                  type="number"
                  min="120"
                  max="250"
                  placeholder="Alt. max"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 items-center">
              <div className="grid grid-cols-2 gap-2 md:col-span-1">
                <Input
                  type="number"
                  min="10"
                  max="60"
                  placeholder="Edad min"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                />
                <Input
                  type="number"
                  min="10"
                  max="60"
                  placeholder="Edad max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-4">
                {isClubOrAgency && (
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <Checkbox
                      checked={availableOnly}
                      onCheckedChange={(checked) => setAvailableOnly(checked === true)}
                    />
                    Solo jugadores disponibles
                  </label>
                )}
                <p className="text-sm text-gray-600">{profiles.length} perfiles encontrados</p>
              </div>

              <div className="md:col-span-1 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                    setCityFilter('')
                    setPositionFilter('all')
                    setLevelFilter('')
                    setAvailabilityFilter('all')
                    setAvailableOnly(false)
                    setMinHeight('')
                    setMaxHeight('')
                    setMinAge('')
                    setMaxAge('')
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {profiles.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No se encontraron perfiles"
            description="Intenta ajustar los filtros de búsqueda para ver más perfiles"
            actionLabel="Crear mi perfil"
            actionHref="/talento#formulario"
            secondaryActionLabel="Limpiar filtros"
            secondaryActionHref="/talento/perfiles"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-stagger">
            {profiles.map((profile) => (
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
                          {profile.verified && <CheckCircle className="w-4 h-4 text-blue-600" />}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getRoleLabel(profile.role)}
                          </Badge>
                          {profile.role === 'jugador' && getAvailabilityBadge(profile.availabilityStatus)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {profile.position && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Posición:</strong> {getPositionLabel(profile.position)}
                    </p>
                  )}

                  {profile.currentLevel && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Nivel:</strong> {profile.currentLevel}
                    </p>
                  )}

                  {profile.bio && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{profile.bio}</p>}

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.city}, {profile.country}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {profile.height && (
                      <span className="flex items-center">
                        <Ruler className="w-3 h-3 mr-1" />
                        {profile.height} cm
                      </span>
                    )}
                    {profile.birthDate && (
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {getAge(profile.birthDate)} años
                      </span>
                    )}
                  </div>

                  {profile.role === 'jugador' && profile.availableFrom && (
                    <p className="text-xs text-gray-500 mb-4">
                      Disponible desde: {formatAvailableFrom(profile.availableFrom)}
                    </p>
                  )}

                  <Link href={`/talento/perfiles/${profile.id}`}>
                    <Button className="w-full" size="sm">
                      Ver perfil completo
                    </Button>
                  </Link>

                  {isClubOrAgency && profile.role === 'jugador' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <ClubRecruitmentActions
                        profileId={profile.id}
                        profileName={profile.fullName}
                        initialShortlisted={!!shortlistMap[profile.id]}
                        initialPipelineStatus={shortlistMap[profile.id]?.status || null}
                        compact
                        onStateChange={(next) => {
                          setShortlistMap((prev) => {
                            const copy = { ...prev }
                            if (!next.shortlisted) {
                              delete copy[profile.id]
                            } else if (next.pipelineStatus) {
                              copy[profile.id] = { status: next.pipelineStatus }
                            }
                            return copy
                          })
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-12 bg-gradient-to-r from-workhoops-accent to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¿Quieres aparecer aquí?</h2>
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
