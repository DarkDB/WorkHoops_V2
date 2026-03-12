'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'

type LeadStatus = 'NEW' | 'REVIEWED' | 'CONTACTED' | 'REJECTED'

interface ClubLeadItem {
  id: string
  fullName: string
  age: number | null
  position: string | null
  height: number | null
  city: string | null
  email: string
  phone: string | null
  message: string | null
  status: LeadStatus
  createdAt: string
}

interface ClubLeadsManagerProps {
  initialLeads: ClubLeadItem[]
}

const statusLabel: Record<LeadStatus, string> = {
  NEW: 'Nuevo',
  REVIEWED: 'Revisado',
  CONTACTED: 'Contactado',
  REJECTED: 'Rechazado'
}

const statusClassName: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  REVIEWED: 'bg-yellow-100 text-yellow-800',
  CONTACTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-gray-100 text-gray-700'
}

export default function ClubLeadsManager({ initialLeads }: ClubLeadsManagerProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL')
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null)

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.fullName.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        (lead.position || '').toLowerCase().includes(search.toLowerCase()) ||
        (lead.city || '').toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [leads, search, statusFilter])

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    setSavingLeadId(leadId)

    try {
      const response = await fetch(`/api/club/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar el estado')
      }

      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)))

      toast.success('Estado actualizado')
    } catch (error) {
      toast.error('Error al actualizar', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.'
      })
    } finally {
      setSavingLeadId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder="Buscar por nombre, email, ciudad o posición"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | LeadStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="NEW">Nuevo</SelectItem>
            <SelectItem value="REVIEWED">Revisado</SelectItem>
            <SelectItem value="CONTACTED">Contactado</SelectItem>
            <SelectItem value="REJECTED">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-600">
            No hay jugadores interesados con los filtros actuales.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{lead.fullName}</h3>
                      <Badge className={statusClassName[lead.status]}>{statusLabel[lead.status]}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{lead.position || 'Posición no indicada'}</span>
                      {lead.age ? <span>{lead.age} años</span> : null}
                      {lead.height ? <span>{lead.height} cm</span> : null}
                      {lead.city ? (
                        <span className="inline-flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {lead.city}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <a href={`mailto:${lead.email}`} className="inline-flex items-center text-workhoops-accent hover:underline">
                        <Mail className="w-4 h-4 mr-1" />
                        {lead.email}
                      </a>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="inline-flex items-center text-workhoops-accent hover:underline">
                          <Phone className="w-4 h-4 mr-1" />
                          {lead.phone}
                        </a>
                      ) : null}
                    </div>

                    {lead.message ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-md p-3 border">
                        {lead.message}
                      </p>
                    ) : null}

                    <p className="text-xs text-gray-500">
                      Recibido el {new Date(lead.createdAt).toLocaleDateString('es-ES')} a las {new Date(lead.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="min-w-[220px]">
                    <p className="text-sm font-medium text-gray-700 mb-2">Estado del lead</p>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateStatus(lead.id, value as LeadStatus)}
                      disabled={savingLeadId === lead.id}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">Nuevo</SelectItem>
                        <SelectItem value="REVIEWED">Revisado</SelectItem>
                        <SelectItem value="CONTACTED">Contactado</SelectItem>
                        <SelectItem value="REJECTED">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                    {savingLeadId === lead.id ? (
                      <p className="text-xs text-gray-500 mt-2">Guardando...</p>
                    ) : (
                      <Button variant="ghost" size="sm" className="mt-2 w-full text-gray-500" disabled>
                        Seguimiento mínimo activo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
