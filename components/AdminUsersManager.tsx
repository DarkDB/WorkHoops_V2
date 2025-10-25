'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Search,
  Filter,
  ArrowLeft,
  Mail,
  Shield,
  UserCircle,
  Calendar,
  Crown
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  planType: string | null
  createdAt: string
  emailVerified: string | null
  _count: {
    opportunities: number
    applications: number
  }
  talentProfile: {
    id: string
    role: string
  } | null
  clubAgencyProfile: {
    id: string
    organizationType: string
  } | null
}

interface AdminUsersManagerProps {
  users: User[]
}

export default function AdminUsersManager({ users }: AdminUsersManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesPlan = planFilter === 'all' || user.planType === planFilter

    return matchesSearch && matchesRole && matchesPlan
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'club':
        return 'bg-blue-100 text-blue-800'
      case 'agencia':
        return 'bg-green-100 text-green-800'
      case 'jugador':
        return 'bg-orange-100 text-orange-800'
      case 'entrenador':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      club: 'Club',
      agencia: 'Agencia',
      jugador: 'Jugador',
      entrenador: 'Entrenador'
    }
    return labels[role] || role
  }

  const getPlanColor = (plan: string | null) => {
    if (!plan || plan === 'gratis') return 'bg-gray-100 text-gray-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    club: users.filter(u => u.role === 'club').length,
    agencia: users.filter(u => u.role === 'agencia').length,
    jugador: users.filter(u => u.role === 'jugador').length,
    entrenador: users.filter(u => u.role === 'entrenador').length,
    pro: users.filter(u => u.planType === 'pro').length
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
          <Users className="w-8 h-8 mr-3 text-blue-600" />
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600 mt-2">Administra usuarios y suscripciones del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Admins</p>
            <p className="text-2xl font-bold text-purple-600">{stats.admin}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Clubs</p>
            <p className="text-2xl font-bold text-blue-600">{stats.club}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Agencias</p>
            <p className="text-2xl font-bold text-green-600">{stats.agencia}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Jugadores</p>
            <p className="text-2xl font-bold text-orange-600">{stats.jugador}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Entrenadores</p>
            <p className="text-2xl font-bold text-teal-600">{stats.entrenador}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Plan Pro</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pro}</p>
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
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                  <SelectItem value="agencia">Agencia</SelectItem>
                  <SelectItem value="jugador">Jugador</SelectItem>
                  <SelectItem value="entrenador">Entrenador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <Crown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los planes</SelectItem>
                  <SelectItem value="gratis">Gratis</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{user.name || 'Sin nombre'}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          {user.planType === 'pro' && (
                            <Badge className={getPlanColor(user.planType)}>
                              <Crown className="w-3 h-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                          {user.emailVerified && (
                            <span className="text-green-600 ml-2">✓ Verificado</span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Registro: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                          </div>
                          <div>
                            {user._count.opportunities} oferta{user._count.opportunities !== 1 ? 's' : ''}
                          </div>
                          <div>
                            {user._count.applications} solicitud{user._count.applications !== 1 ? 'es' : ''}
                          </div>
                        </div>
                        {user.talentProfile && (
                          <div className="mt-2 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded inline-block">
                            Perfil de talento: {user.talentProfile.playerRole}
                          </div>
                        )}
                        {user.clubAgencyProfile && (
                          <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                            Perfil de club: {user.clubAgencyProfile.clubType}
                          </div>
                        )}
                      </div>
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
