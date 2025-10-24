'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Briefcase,
  FileCheck,
  FileText,
  Shield,
  TrendingUp,
  Settings
} from 'lucide-react'

interface AdminDashboardProps {
  totalUsers: number
  totalOpportunities: number
  pendingOpportunities: number
  totalApplications: number
}

export default function AdminDashboard({
  totalUsers,
  totalOpportunities,
  pendingOpportunities,
  totalApplications
}: AdminDashboardProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Shield className="w-8 h-8 mr-3 text-workhoops-accent" />
          Panel de Administración
        </h1>
        <p className="text-gray-600 mt-2">Gestiona usuarios, ofertas y contenido de WorkHoops</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <Link href="/admin/users">
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-600">
                  Ver usuarios →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ofertas</p>
                <p className="text-3xl font-bold text-gray-900">{totalOpportunities}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Link href="/admin/opportunities">
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-green-600">
                  Ver ofertas →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{pendingOpportunities}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-yellow-600">
              Requieren revisión
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solicitudes</p>
                <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Total de aplicaciones
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-workhoops-accent" />
              Gestión de Ofertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Revisa, aprueba o rechaza ofertas publicadas por clubs y agencias.
            </p>
            <Link href="/admin/opportunities">
              <Button className="w-full bg-workhoops-accent hover:bg-orange-600">
                Ver ofertas
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Administra usuarios, suscripciones y pagos en el sistema.
            </p>
            <Link href="/admin/users">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Ver usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Recursos y Contenido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Crea y gestiona artículos, guías y recursos para la comunidad.
            </p>
            <Link href="/recursos">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Ver recursos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Estado del sistema</p>
                <p className="font-semibold text-green-600">✓ Operativo</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Base de datos</p>
                <p className="font-semibold text-green-600">✓ Conectada</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Servicios de email</p>
                <p className="font-semibold text-green-600">✓ Activo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
