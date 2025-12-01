'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  GraduationCap, 
  Building2, 
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

type ImportType = 'jugadores' | 'entrenadores' | 'clubes' | 'ofertas'

interface ImportResult {
  success: number
  errors: number
  details: string[]
}

export default function ImportarPage() {
  const [selectedType, setSelectedType] = useState<ImportType>('jugadores')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const importTypes = [
    {
      id: 'jugadores' as ImportType,
      label: 'Jugadores',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      description: 'Perfiles de talento/jugadores',
    },
    {
      id: 'entrenadores' as ImportType,
      label: 'Entrenadores',
      icon: GraduationCap,
      color: 'bg-green-100 text-green-800',
      description: 'Perfiles de entrenadores',
    },
    {
      id: 'clubes' as ImportType,
      label: 'Clubes',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      description: 'Organizaciones/clubes',
    },
    {
      id: 'ofertas' as ImportType,
      label: 'Ofertas',
      icon: Briefcase,
      color: 'bg-orange-100 text-orange-800',
      description: 'Oportunidades laborales',
    },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    } else {
      toast.error('Por favor selecciona un archivo CSV válido')
    }
  }

  const parseCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim())
      const row: any = { _rowNumber: index + 2 }
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })

    setPreview(data.slice(0, 10)) // Preview primeras 10 filas
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', selectedType)

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success(`Importación completada: ${data.success} registros creados`)
        setFile(null)
        setPreview([])
      } else {
        toast.error(data.error || 'Error al importar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la importación')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = (type: ImportType) => {
    const templates = {
      jugadores: 'email,nombre_completo,fecha_nacimiento,ciudad,pais,posicion,altura,peso,telefono,nivel_actual\njugador@ejemplo.com,Juan Pérez,1995-05-15,Madrid,España,Base,185,80,+34600000000,Semi-profesional',
      entrenadores: 'email,nombre_completo,ciudad,pais,experiencia_años,licencia,especialidad,telefono\nentrenador@ejemplo.com,María García,Barcelona,España,10,Nivel 3,Formación,+34600000000',
      clubes: 'email_responsable,nombre_club,descripcion,ciudad,website,tipo\nclub@ejemplo.com,Club Baloncesto Madrid,Club de baloncesto profesional,Madrid,https://clubmadrid.com,club',
      ofertas: 'titulo,tipo,nivel,ciudad,descripcion,email_contacto,fecha_limite,salario_min,salario_max\nBusco Base para Liga EBA,empleo,semi_profesional,Madrid,Buscamos base con experiencia,contacto@club.com,2025-12-31,800,1200',
    }

    const content = templates[type]
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template_${type}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const currentType = importTypes.find(t => t.id === selectedType)!

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Importación Masiva
          </h1>
          <p className="text-gray-600">
            Importa múltiples registros a la vez usando archivos CSV
          </p>
        </div>

        {/* Selector de Tipo */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {importTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id

            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-workhoops-accent shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => {
                  setSelectedType(type.id)
                  setFile(null)
                  setPreview([])
                  setResult(null)
                }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-3`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {type.label}
                  </h3>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Área principal */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de carga */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importar {currentType.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        Paso 1: Descarga la plantilla
                      </h4>
                      <p className="text-sm text-blue-700">
                        Usa esta plantilla CSV para asegurar el formato correcto
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate(selectedType)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Paso 2: Sube tu archivo CSV
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-workhoops-accent transition-colors">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer"
                    >
                      <Button variant="outline" asChild>
                        <span>Seleccionar archivo CSV</span>
                      </Button>
                    </label>
                    {file && (
                      <p className="text-sm text-gray-600 mt-2">
                        Archivo: <strong>{file.name}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {preview.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Vista previa (primeras 10 filas)
                    </h4>
                    <div className="border rounded-lg overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(preview[0])
                              .filter(key => key !== '_rowNumber')
                              .map(key => (
                                <th
                                  key={key}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                >
                                  {key}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {preview.map((row, i) => (
                            <tr key={i}>
                              {Object.keys(row)
                                .filter(key => key !== '_rowNumber')
                                .map(key => (
                                  <td
                                    key={key}
                                    className="px-4 py-2 text-sm text-gray-900"
                                  >
                                    {row[key]}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import button */}
                {file && (
                  <Button
                    onClick={handleImport}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Importar {currentType.label}
                      </>
                    )}
                  </Button>
                )}

                {/* Results */}
                {result && (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          {result.success} registros creados exitosamente
                        </span>
                      </div>
                    </div>

                    {result.errors > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-900">
                            {result.errors} errores encontrados
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {result.details.slice(0, 5).map((detail, i) => (
                            <p key={i} className="text-sm text-red-700">
                              • {detail}
                            </p>
                          ))}
                          {result.details.length > 5 && (
                            <p className="text-sm text-red-600 font-medium">
                              ... y {result.details.length - 5} errores más
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de ayuda */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="w-4 h-4" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Formato del archivo
                  </h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Formato: CSV (valores separados por comas)</li>
                    <li>• Primera fila: nombres de columnas</li>
                    <li>• Codificación: UTF-8</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Notas importantes
                  </h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Solo se crearán registros nuevos</li>
                    <li>• Emails duplicados serán omitidos</li>
                    <li>• Revisa la vista previa antes de importar</li>
                    <li>• Máximo 1000 filas por importación</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Formatos especiales
                  </h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Fechas: YYYY-MM-DD (ej: 2025-12-31)</li>
                    <li>• Números: sin símbolos ni comas</li>
                    <li>• Teléfonos: formato internacional</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
