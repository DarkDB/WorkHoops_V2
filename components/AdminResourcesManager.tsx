'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  FileText,
  ArrowLeft,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

export default function AdminResourcesManager() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'guias'
  })

  const mockResources = [
    {
      id: '1',
      title: 'Cómo preparar tu CV deportivo',
      excerpt: 'Guía completa para crear un CV que destaque en el mundo del baloncesto',
      category: 'Guías',
      createdAt: '2024-10-20'
    },
    {
      id: '2',
      title: 'Consejos para entrevistas',
      excerpt: 'Todo lo que necesitas saber antes de una entrevista con un club',
      category: 'Consejos',
      createdAt: '2024-10-18'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // TODO: Implement API call to create/update resource
    toast.success('¡Recurso guardado!', {
      description: 'El recurso se ha guardado correctamente'
    })
    
    setShowForm(false)
    setFormData({ title: '', content: '', excerpt: '', category: 'guias' })
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-green-600" />
              Gestión de Recursos
            </h1>
            <p className="text-gray-600 mt-2">Crea y administra artículos y guías para la comunidad</p>
          </div>
          <Button 
            className="bg-workhoops-accent hover:bg-orange-600"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Recurso
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Crear Nuevo Recurso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título del recurso"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="guias">Guías</option>
                  <option value="consejos">Consejos</option>
                  <option value="entrevistas">Entrevistas</option>
                  <option value="noticias">Noticias</option>
                </select>
              </div>

              <div>
                <Label htmlFor="excerpt">Resumen *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve descripción del recurso"
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenido completo del recurso (soporta Markdown)"
                  rows={8}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-workhoops-accent hover:bg-orange-600">
                  Guardar Recurso
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Resources List */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Publicados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockResources.map((resource) => (
              <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{resource.excerpt}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {resource.category}
                      </span>
                      <span>
                        {new Date(resource.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> La funcionalidad de gestión de recursos está en desarrollo. 
              Actualmente mostrando datos de ejemplo. Para implementar completamente:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
              <li>Crear tabla de recursos en la base de datos</li>
              <li>Implementar API endpoints (crear, editar, eliminar)</li>
              <li>Conectar con el formulario</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
