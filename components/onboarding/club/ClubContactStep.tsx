'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Mail, Phone, Globe } from 'lucide-react'

interface ClubContactStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function ClubContactStep({ formData, updateFormData }: ClubContactStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 2 de 5:</strong> Información de contacto
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Persona de Contacto</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPerson">Nombre completo</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => updateFormData({ contactPerson: e.target.value })}
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <Label htmlFor="contactRole">Cargo</Label>
            <Input
              id="contactRole"
              value={formData.contactRole}
              onChange={(e) => updateFormData({ contactRole: e.target.value })}
              placeholder="Director Deportivo"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-workhoops-accent" />
          Datos de Contacto
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="contactEmail">Email de contacto *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateFormData({ contactEmail: e.target.value })}
              placeholder="contacto@club.com"
            />
          </div>

          <div>
            <Label htmlFor="contactPhone">Teléfono / WhatsApp</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => updateFormData({ contactPhone: e.target.value })}
              placeholder="+34 600 000 000"
            />
          </div>

          <div>
            <Label htmlFor="contactPreference">Preferencia de contacto</Label>
            <Select
              value={formData.contactPreference}
              onValueChange={(value) => updateFormData({ contactPreference: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="¿Cómo prefieres que te contacten?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telefono">Teléfono</SelectItem>
                <SelectItem value="portal">Portal interno WorkHoops</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-workhoops-accent" />
          Redes y Web
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="website">Sitio web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => updateFormData({ website: e.target.value })}
              placeholder="https://www.club.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => updateFormData({ instagramUrl: e.target.value })}
                placeholder="https://instagram.com/club"
              />
            </div>

            <div>
              <Label htmlFor="twitterUrl">Twitter / X</Label>
              <Input
                id="twitterUrl"
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => updateFormData({ twitterUrl: e.target.value })}
                placeholder="https://twitter.com/club"
              />
            </div>

            <div>
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => updateFormData({ linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/company/club"
              />
            </div>

            <div>
              <Label htmlFor="youtubeUrl">YouTube</Label>
              <Input
                id="youtubeUrl"
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => updateFormData({ youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/@club"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Privacidad del Contacto</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showEmailPublic"
              checked={formData.showEmailPublic || false}
              onCheckedChange={(checked) => updateFormData({ showEmailPublic: checked })}
            />
            <Label htmlFor="showEmailPublic" className="cursor-pointer">
              Mostrar email públicamente en el perfil
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPhonePublic"
              checked={formData.showPhonePublic || false}
              onCheckedChange={(checked) => updateFormData({ showPhonePublic: checked })}
            />
            <Label htmlFor="showPhonePublic" className="cursor-pointer">
              Mostrar teléfono públicamente en el perfil
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="candidatesViaPortal"
              checked={formData.candidatesViaPortal !== false}
              onCheckedChange={(checked) => updateFormData({ candidatesViaPortal: checked })}
            />
            <Label htmlFor="candidatesViaPortal" className="cursor-pointer">
              Recibir candidaturas solo vía WorkHoops (recomendado)
            </Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Documento Fiscal (Opcional)</h3>
        <div>
          <Label htmlFor="fiscalDocument">CIF / NIF / VAT</Label>
          <Input
            id="fiscalDocument"
            value={formData.fiscalDocument}
            onChange={(e) => updateFormData({ fiscalDocument: e.target.value })}
            placeholder="A12345678"
          />
          <p className="text-xs text-gray-500 mt-1">
            Para verificación administrativa (no se mostrará públicamente)
          </p>
        </div>
      </Card>
    </div>
  )
}
