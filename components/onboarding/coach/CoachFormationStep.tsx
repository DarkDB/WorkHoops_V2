'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { GraduationCap, Youtube, Image } from 'lucide-react'

interface CoachFormationStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function CoachFormationStep({ formData, updateFormData }: CoachFormationStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 5 de 6:</strong> Formación y multimedia - Muestra tus credenciales
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-workhoops-accent" />
          Titulaciones Académicas
        </h3>
        <div>
          <Label htmlFor="academicDegrees">Titulaciones (INEF, CAFD, etc.)</Label>
          <Textarea
            id="academicDegrees"
            value={formData.academicDegrees}
            onChange={(e) => updateFormData({ academicDegrees: e.target.value })}
            placeholder="Licenciado en Ciencias del Deporte - Universidad Politécnica de Madrid (2015)"
            rows={3}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Certificaciones y Cursos</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="certifications">Certificaciones adicionales</Label>
            <Textarea
              id="certifications"
              value={formData.certifications}
              onChange={(e) => updateFormData({ certifications: e.target.value })}
              placeholder="Certificado FIBA Nivel 2, FEB Entrenador Superior..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="coursesAttended">Cursos y clínicas asistidas o impartidas</Label>
            <Textarea
              id="coursesAttended"
              value={formData.coursesAttended}
              onChange={(e) => updateFormData({ coursesAttended: e.target.value })}
              placeholder="Curso de defensa - José Luis Abos (2020), Clínica de ataque posicional - Sergio Scariolo (2019)..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Youtube className="w-5 h-5 mr-2 text-red-600" />
          Material Multimedia
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="videoUrl">Vídeo de entrenamientos o partidos (YouTube/Vimeo)</Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => updateFormData({ videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              type="url"
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional pero muy recomendado para destacar tu perfil
            </p>
          </div>

          <div>
            <Label htmlFor="presentationsUrl">Presentaciones tácticas o PDFs (opcional)</Label>
            <Input
              id="presentationsUrl"
              value={formData.presentationsUrl}
              onChange={(e) => updateFormData({ presentationsUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              type="url"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <div className="flex items-center text-sm text-gray-600">
          <Image className="w-4 h-4 mr-2" />
          <p>Las fotos se pueden añadir en el siguiente paso o en tu perfil después</p>
        </div>
      </Card>
    </div>
  )
}
