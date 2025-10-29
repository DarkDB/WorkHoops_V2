'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Image, Video, CheckCircle, Upload } from 'lucide-react'

interface ClubVerificationStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function ClubVerificationStep({ formData, updateFormData }: ClubVerificationStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 5 de 5:</strong> Verificación y multimedia
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Image className="w-5 h-5 mr-2 text-workhoops-accent" />
          Logo y Fotos
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="logo">URL del logo</Label>
            <Input
              id="logo"
              type="url"
              value={formData.logo}
              onChange={(e) => updateFormData({ logo: e.target.value })}
              placeholder="https://ejemplo.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sube tu logo a un servicio como Imgur o usa un enlace directo
            </p>
          </div>

          <div>
            <Label htmlFor="facilityPhotos">URLs de fotos de instalaciones (separadas por comas)</Label>
            <Input
              id="facilityPhotos"
              value={formData.facilityPhotosInput}
              onChange={(e) => {
                updateFormData({ facilityPhotosInput: e.target.value })
                // Convert comma-separated URLs to array
                const urls = e.target.value.split(',').map(u => u.trim()).filter(u => u)
                updateFormData({ facilityPhotos: urls })
              }}
              placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Muestra tus instalaciones, pistas, gimnasio, vestuarios, etc.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Video className="w-5 h-5 mr-2 text-red-600" />
          Video Institucional
        </h3>
        <div>
          <Label htmlFor="institutionalVideo">URL del video (YouTube/Vimeo)</Label>
          <Input
            id="institutionalVideo"
            type="url"
            value={formData.institutionalVideo}
            onChange={(e) => updateFormData({ institutionalVideo: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Video de presentación del club, instalaciones, equipo, etc.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Verificación
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Upload className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Verificación de organización
                </p>
                <p className="text-xs text-gray-600">
                  Para verificar tu organización, el equipo de WorkHoops revisará tu perfil. 
                  Puedes adjuntar documentos de registro federativo enviando un email a verificacion@workhoops.com
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requestVerification"
              checked={formData.requestVerification || false}
              onCheckedChange={(checked) => updateFormData({ requestVerification: checked })}
            />
            <Label htmlFor="requestVerification" className="cursor-pointer">
              Solicitar verificación de la organización
            </Label>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold mb-2 text-green-900">
          ¡Último paso!
        </h3>
        <p className="text-sm text-green-800">
          Cuando hagas clic en "Finalizar", tu perfil de {formData.entityType || 'organización'} 
          estará listo y podrás empezar a buscar talento, publicar ofertas y conectar con jugadores y entrenadores.
        </p>
      </Card>
    </div>
  )
}
