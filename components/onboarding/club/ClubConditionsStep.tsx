'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { DollarSign, Home, FileText } from 'lucide-react'

interface ClubConditionsStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function ClubConditionsStep({ formData, updateFormData }: ClubConditionsStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 4 de 5:</strong> Condiciones ofrecidas (opcional pero recomendado)
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-workhoops-accent" />
          Compensación Económica
        </h3>
        <div>
          <Label htmlFor="salaryRange">Rango salarial (opcional)</Label>
          <Input
            id="salaryRange"
            value={formData.salaryRange}
            onChange={(e) => updateFormData({ salaryRange: e.target.value })}
            placeholder="1.000-2.000€/mes, 15.000€/temporada, Beca completa, etc."
          />
          <p className="text-xs text-gray-500 mt-1">
            Puedes dejarlo en blanco si prefieres no especificarlo
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Home className="w-5 h-5 mr-2 text-workhoops-accent" />
          Beneficios Incluidos
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="housingProvided"
              checked={formData.housingProvided || false}
              onCheckedChange={(checked) => updateFormData({ housingProvided: checked })}
            />
            <Label htmlFor="housingProvided" className="cursor-pointer">
              Vivienda proporcionada
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mealsTransport"
              checked={formData.mealsTransport || false}
              onCheckedChange={(checked) => updateFormData({ mealsTransport: checked })}
            />
            <Label htmlFor="mealsTransport" className="cursor-pointer">
              Dietas y/o transporte
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="medicalInsurance"
              checked={formData.medicalInsurance || false}
              onCheckedChange={(checked) => updateFormData({ medicalInsurance: checked })}
            />
            <Label htmlFor="medicalInsurance" className="cursor-pointer">
              Seguro médico
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="visaSupport"
              checked={formData.visaSupport || false}
              onCheckedChange={(checked) => updateFormData({ visaSupport: checked })}
            />
            <Label htmlFor="visaSupport" className="cursor-pointer">
              Gestión de visado / permiso de trabajo
            </Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Tipo de Contrato</h3>
        <Select
          value={formData.contractType}
          onValueChange={(value) => updateFormData({ contractType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tipo de contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profesional">Profesional</SelectItem>
            <SelectItem value="beca">Beca deportiva</SelectItem>
            <SelectItem value="amateur">Amateur / Sin contrato</SelectItem>
            <SelectItem value="practicas">Prácticas</SelectItem>
            <SelectItem value="freelance">Freelance / Por proyecto</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-workhoops-accent" />
          Documentación Requerida
        </h3>
        <div>
          <Label htmlFor="requiredDocs">Documentos que solicitas al candidato</Label>
          <Textarea
            id="requiredDocs"
            value={formData.requiredDocs}
            onChange={(e) => updateFormData({ requiredDocs: e.target.value })}
            placeholder="Pasaporte, Carta de liberación del club anterior, Video highlights, Métricas de rendimiento..."
            rows={3}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Política de Representantes</h3>
        <Select
          value={formData.agentPolicy}
          onValueChange={(value) => updateFormData({ agentPolicy: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="¿Trabajáis con agentes?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="acepta_con_agente">Aceptamos jugadores con agente</SelectItem>
            <SelectItem value="prefiere_sin_agente">Preferimos sin agente</SelectItem>
            <SelectItem value="indiferente">Indiferente</SelectItem>
            <SelectItem value="solo_sin_agente">Solo jugadores sin agente</SelectItem>
          </SelectContent>
        </Select>
      </Card>
    </div>
  )
}
