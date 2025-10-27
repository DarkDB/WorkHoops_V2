'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Video, Film, Instagram, Link as LinkIcon } from 'lucide-react'

interface MultimediaStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function MultimediaStep({ formData, updateFormData }: MultimediaStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Contenido multimedia (opcional):</strong> Agregar videos y enlaces te ayudará a destacar. 
          Los clubs podrán ver tu juego en acción.
        </p>
      </div>

      {/* Videos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Video className="w-5 h-5 mr-2 text-workhoops-accent" />
          Videos de Juego
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="videoUrl" className="flex items-center">
              <Film className="w-4 h-4 mr-2" />
              Video de highlights (YouTube o Vimeo)
            </Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => updateFormData({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Sube un video de tus mejores jugadas (3-5 minutos recomendado)
            </p>
          </div>

          <div>
            <Label htmlFor="fullGameUrl" className="flex items-center">
              <Film className="w-4 h-4 mr-2" />
              Video de partido completo (YouTube o Vimeo)
            </Label>
            <Input
              id="fullGameUrl"
              type="url"
              value={formData.fullGameUrl}
              onChange={(e) => updateFormData({ fullGameUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Un partido completo permite ver tu juego en contexto
            </p>
          </div>
        </div>
      </Card>

      {/* Redes Sociales */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Instagram className="w-5 h-5 mr-2 text-workhoops-accent" />
          Redes Sociales
        </h3>
        <div>
          <Label htmlFor="socialUrl" className="flex items-center">
            <LinkIcon className="w-4 h-4 mr-2" />
            Perfil de Instagram / Twitter / LinkedIn
          </Label>
          <Input
            id="socialUrl"
            type="url"
            value={formData.socialUrl}
            onChange={(e) => updateFormData({ socialUrl: e.target.value })}
            placeholder="https://instagram.com/tu_usuario"
          />
          <p className="text-xs text-gray-500 mt-1">
            Comparte tu perfil donde muestres tu actividad deportiva
          </p>
        </div>
      </Card>

      {/* Preview de videos */}
      {(formData.videoUrl || formData.fullGameUrl) && (
        <Card className="p-6 bg-gray-50">
          <h4 className="font-semibold mb-3 text-gray-900">Vista Previa</h4>
          <div className="space-y-3">
            {formData.videoUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Highlights:</p>
                <div className="bg-white p-3 rounded border">
                  <a 
                    href={formData.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {formData.videoUrl}
                  </a>
                </div>
              </div>
            )}
            {formData.fullGameUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Partido completo:</p>
                <div className="bg-white p-3 rounded border">
                  <a 
                    href={formData.fullGameUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {formData.fullGameUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Consejos */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <h4 className="font-semibold mb-3 text-gray-900">💡 Consejos para mejores resultados</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-workhoops-accent mr-2">•</span>
            <span>Los videos de highlights de 3-5 minutos funcionan mejor que videos muy largos</span>
          </li>
          <li className="flex items-start">
            <span className="text-workhoops-accent mr-2">•</span>
            <span>Asegúrate de que los videos sean públicos o "no listados" en YouTube</span>
          </li>
          <li className="flex items-start">
            <span className="text-workhoops-accent mr-2">•</span>
            <span>Incluye jugadas que muestren diferentes aspectos de tu juego</span>
          </li>
          <li className="flex items-start">
            <span className="text-workhoops-accent mr-2">•</span>
            <span>Un perfil profesional de Instagram con contenido deportivo puede marcar la diferencia</span>
          </li>
        </ul>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>✓ Casi listo:</strong> Tu perfil estará visible para clubs una vez completes este último paso. 
          Puedes agregar videos más tarde desde tu perfil si aún no los tienes.
        </p>
      </div>
    </div>
  )
}
