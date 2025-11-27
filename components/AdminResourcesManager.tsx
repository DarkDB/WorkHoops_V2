'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Save,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface Resource {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  status: string
  featured: boolean
  featuredImage: string | null
  author: string
  readTime: number
  views: number
  createdAt: string
}

const categories = [
  { value: 'preparacion', label: 'Preparación' },
  { value: 'carrera', label: 'Carrera' },
  { value: 'recursos', label: 'Recursos' },
  { value: 'salud', label: 'Salud' },
  { value: 'tactica', label: 'Táctica' },
  { value: 'mental', label: 'Mental' },
]

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

export default function AdminResourcesManager() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'preparacion',
    status: 'draft',
    featured: false,
    featuredImage: '',
    author: '',
    readTime: 5,
    metaTitle: '',
    metaDescription: '',
  })

  useEffect(() => {
    fetchResources()
  }, [filterStatus, filterCategory])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)

      const response = await fetch(`/api/resources?${params}`)
      if (!response.ok) throw new Error('Error al cargar recursos')

      const data = await response.json()
      setResources(data.resources)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar recursos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingResource(null)
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'preparacion',
      status: 'draft',
      featured: false,
      featuredImage: '',
      author: '',
      readTime: 5,
      metaTitle: '',
      metaDescription: '',
    })
    setIsEditorOpen(true)
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      slug: resource.slug,
      excerpt: resource.excerpt,
      content: resource.content,
      category: resource.category,
      status: resource.status,
      featured: resource.featured,
      featuredImage: resource.featuredImage || '',
      author: resource.author,
      readTime: resource.readTime,
      metaTitle: '',
      metaDescription: '',
    })
    setIsEditorOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este recurso?')) return

    try {
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      toast.success('Recurso eliminado correctamente')
      fetchResources()
    } catch (error) {
      toast.error('Error al eliminar recurso')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/resources/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Error al subir imagen')

      const data = await response.json()
      setFormData(prev => ({ ...prev, featuredImage: data.url }))
      toast.success('Imagen subida correctamente')
    } catch (error) {
      toast.error('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.author) {
        toast.error('Por favor completa todos los campos requeridos')
        return
      }

      const url = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources'
      const method = editingResource ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar')
      }

      toast.success(editingResource ? 'Recurso actualizado' : 'Recurso creado')
      setIsEditorOpen(false)
      fetchResources()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar')
    }
  }

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Recursos</h2>
          <p className="text-gray-600">Administra el contenido del blog</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Recurso
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card><CardContent className="py-8 text-center"><p>Cargando...</p></CardContent></Card>
        ) : filteredResources.length === 0 ? (
          <Card><CardContent className="py-8 text-center"><p>No hay recursos</p></CardContent></Card>
        ) : (
          filteredResources.map(resource => (
            <Card key={resource.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {resource.featuredImage && (
                    <img src={resource.featuredImage} alt={resource.title} className="w-32 h-32 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{resource.title}</h3>
                          {resource.featured && <Badge variant="secondary">Destacado</Badge>}
                          <Badge variant={resource.status === 'published' ? 'default' : 'secondary'}>
                            {resource.status === 'published' ? <><Eye className="w-3 h-3 mr-1" />Publicado</> : <><EyeOff className="w-3 h-3 mr-1" />Borrador</>}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{resource.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{resource.author}</span>
                          <span>•</span>
                          <span>{resource.readTime} min</span>
                          <span>•</span>
                          <span>{resource.views} vistas</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(resource)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(resource.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingResource ? 'Editar' : 'Crear'} Recurso</DialogTitle>
            <DialogDescription>Completa la información</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input value={formData.title} onChange={(e) => {
                  const title = e.target.value
                  setFormData(prev => ({ ...prev, title, slug: prev.slug || generateSlug(title) }))
                }} />
              </div>
              <div className="col-span-2">
                <Label>Slug *</Label>
                <Input value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} />
              </div>
              <div>
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Autor *</Label>
                <Input value={formData.author} onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))} />
              </div>
              <div>
                <Label>Tiempo (min) *</Label>
                <Input type="number" value={formData.readTime} onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))} />
                <Label htmlFor="featured">Destacado</Label>
              </div>
            </div>

            <div>
              <Label>Extracto *</Label>
              <Textarea value={formData.excerpt} onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} rows={3} maxLength={200} />
            </div>

            <div>
              <Label>Imagen</Label>
              <div className="space-y-2">
                {formData.featuredImage && (
                  <div className="relative w-full h-48">
                    <img src={formData.featuredImage} alt="Preview" className="w-full h-full object-cover rounded" />
                    <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </div>
            </div>

            <div>
              <Label>Contenido *</Label>
              <div className="border rounded">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  modules={quillModules}
                  style={{ height: '300px', marginBottom: '50px' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
