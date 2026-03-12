'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ClubInterestFormProps {
  clubSlug: string
  initialValues?: {
    fullName?: string
    age?: number | null
    position?: string | null
    height?: number | null
    city?: string | null
    email?: string
    phone?: string | null
  }
}

export default function ClubInterestForm({ clubSlug, initialValues }: ClubInterestFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: initialValues?.fullName || '',
    age: initialValues?.age ? String(initialValues.age) : '',
    position: initialValues?.position || '',
    height: initialValues?.height ? String(initialValues.height) : '',
    city: initialValues?.city || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    message: ''
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setLoading(true)

    try {
      const response = await fetch(`/api/clubs/${clubSlug}/lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          age: formData.age ? Number(formData.age) : null,
          position: formData.position || null,
          height: formData.height ? Number(formData.height) : null,
          city: formData.city || null,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo enviar la solicitud')
      }

      setSubmitted(true)
      toast.success('Solicitud enviada', {
        description: 'El club ha recibido tu interés correctamente.'
      })
    } catch (error) {
      toast.error('Error al enviar', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo en unos minutos.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-900">Solicitud enviada</p>
        <p className="text-sm text-green-800 mt-1">
          El club revisará tu información. Mientras tanto, puedes completar tu perfil en WorkHoops para aumentar tus opciones.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Nombre *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            type="number"
            min={12}
            max={60}
            value={formData.age}
            onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="position">Posición</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
            placeholder="Base, Escolta..."
          />
        </div>
        <div>
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            min={120}
            max={250}
            value={formData.height}
            onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+34 600 000 000"
        />
      </div>

      <div>
        <Label htmlFor="message">Mensaje *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          rows={5}
          placeholder="Cuéntale al club tu experiencia, disponibilidad y por qué encajarías en su proyecto."
          required
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Button type="submit" className="bg-workhoops-accent hover:bg-orange-600" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar solicitud'
          )}
        </Button>
        <a href="/auth/register" className="text-sm text-workhoops-accent hover:underline">
          ¿Aún sin perfil? Crea tu cuenta en WorkHoops
        </a>
      </div>
    </form>
  )
}
