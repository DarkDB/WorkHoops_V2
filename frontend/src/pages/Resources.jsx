import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Calendar, User, ArrowRight, Search, Filter, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');

  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'consejos', label: 'Consejos' },
    { value: 'guias', label: 'Guías' },
    { value: 'recursos', label: 'Recursos' },
    { value: 'entrenamiento', label: 'Entrenamiento' },
    { value: 'carrera', label: 'Desarrollo de carrera' },
    { value: 'salud', label: 'Salud y bienestar' }
  ];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/articles`;
      if (selectedCategory) {
        url += `?categoria=${selectedCategory}`;
      }
      
      const response = await axios.get(url);
      let filteredArticles = response.data;
      
      // Client-side search filter
      if (searchTerm) {
        filteredArticles = filteredArticles.filter(article => 
          article.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.extracto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.cuerpo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setArticles(filteredArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set('q', searchTerm);
    if (selectedCategory) newSearchParams.set('categoria', selectedCategory);
    setSearchParams(newSearchParams);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set('q', searchTerm);
    if (category) newSearchParams.set('categoria', category);
    setSearchParams(newSearchParams);
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Sample featured articles for empty state
  const featuredArticles = [
    {
      id: 'featured-1',
      titulo: 'Cómo prepararse para una prueba de baloncesto',
      extracto: 'Guía completa para afrontar con éxito las pruebas de selección en clubs de baloncesto profesional.',
      categoria: 'Consejos',
      autor: 'Equipo WorkHoops',
      fecha_publicacion: new Date().toISOString(),
      portada: 'https://images.pexels.com/photos/6763716/pexels-photo-6763716.jpeg'
    },
    {
      id: 'featured-2',
      titulo: 'Plantilla de CV deportivo para jugadores',
      extracto: 'Descarga nuestra plantilla gratuita para crear un CV deportivo que destaque tu talento y experiencia.',
      categoria: 'Recursos',
      autor: 'Equipo WorkHoops',
      fecha_publicacion: new Date().toISOString(),
      portada: 'https://images.pexels.com/photos/6763758/pexels-photo-6763758.jpeg'
    },
    {
      id: 'featured-3',
      titulo: 'Prevención de lesiones en baloncesto',
      extracto: 'Ejercicios y técnicas fundamentales para prevenir las lesiones más comunes en el baloncesto.',
      categoria: 'Salud',
      autor: 'Dr. María González',
      fecha_publicacion: new Date().toISOString(),
      portada: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsfGVufDB8fHx8MTc1OTA4ODc3OXww&ixlib=rb-4.1.0&q=85'
    }
  ];

  const articlesToShow = articles.length > 0 ? articles : featuredArticles;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="resources-page">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Recursos para tu desarrollo
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Guías, consejos y herramientas para impulsar tu carrera en el baloncesto español
            </p>
            
            {/* Search and Filter */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48" data-testid="category-filter">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" data-testid="search-button">
                Buscar
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured/Popular Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Categorías populares
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(1).map((category) => (
              <Button
                key={category.value}
                variant="outline"
                className="justify-center h-auto py-4"
                onClick={() => handleCategoryChange(category.value)}
                data-testid={`category-${category.value}`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory 
                  ? `Artículos de ${categories.find(c => c.value === selectedCategory)?.label}` 
                  : 'Todos los artículos'
                }
              </h2>
              <p className="text-gray-600">
                {loading ? 'Cargando...' : `${articlesToShow.length} artículos encontrados`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articlesToShow.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron artículos
              </h3>
              <p className="text-gray-600 mb-4">
                Prueba con otros términos de búsqueda o selecciona una categoría diferente
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSearchParams({});
                  fetchArticles();
                }} 
                variant="outline"
                data-testid="clear-filters-button"
              >
                Ver todos los artículos
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="articles-grid">
              {articlesToShow.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {article.portada && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.portada}
                        alt={article.titulo}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">
                        {article.categoria}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {getReadingTime(article.cuerpo || article.extracto)} min
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">
                      {article.titulo}
                    </CardTitle>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      {article.autor}
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(article.fecha_publicacion).toLocaleDateString('es-ES')}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.extracto}
                    </p>
                    
                    {article.slug ? (
                      <Link to={`/recursos/${article.slug}`}>
                        <Button variant="outline" className="w-full" data-testid={`article-link-${article.id}`}>
                          Leer más
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Próximamente
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-orange-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Te ha resultado útil?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Suscríbete a nuestra newsletter para recibir los mejores consejos 
            y recursos directamente en tu email
          </p>
          <Link to="/#newsletter">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100" data-testid="newsletter-cta">
              Suscribirme ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Resources;