import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, CheckCircle, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Opportunities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    tipo: searchParams.get('tipo') || '',
    nivel: searchParams.get('nivel') || '',
    ubicacion: searchParams.get('ubicacion') || '',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const opportunityTypes = [
    { value: 'empleo', label: 'Empleo' },
    { value: 'prueba', label: 'Prueba' },
    { value: 'torneo', label: 'Torneo' },
    { value: 'beca', label: 'Beca' },
    { value: 'patrocinio', label: 'Patrocinio' },
    { value: 'clinica', label: 'Clínica' }
  ];

  const levels = [
    { value: 'amateur', label: 'Amateur' },
    { value: 'semi-pro', label: 'Semi-profesional' },
    { value: 'cantera', label: 'Cantera' },
    { value: 'profesional', label: 'Profesional' }
  ];

  const cities = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 
    'Murcia', 'Zaragoza', 'Las Palmas', 'Alicante'
  ];

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.nivel) params.append('nivel', filters.nivel);
      if (filters.ubicacion) params.append('ubicacion', filters.ubicacion);
      
      const response = await axios.get(`${BACKEND_URL}/api/opportunities?${params.toString()}`);
      
      let filteredOpps = response.data;
      
      // Client-side search filter
      if (filters.search) {
        filteredOpps = filteredOpps.filter(opp => 
          opp.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
          opp.organizacion_nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
          opp.descripcion.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setOpportunities(filteredOpps);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tipo: '',
      nivel: '',
      ubicacion: '',
    });
    setSearchParams({});
  };

  const getOpportunityTypeLabel = (type) => {
    const found = opportunityTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTypeColor = (type) => {
    const colors = {
      empleo: 'bg-green-100 text-green-800',
      prueba: 'bg-blue-100 text-blue-800',
      torneo: 'bg-purple-100 text-purple-800',
      beca: 'bg-orange-100 text-orange-800',
      patrocinio: 'bg-pink-100 text-pink-800',
      clinica: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar oportunidades..."
            value={filters.search}
            onChange={(e) => updateFilters('search', e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de oportunidad
        </label>
        <Select value={filters.tipo} onValueChange={(value) => updateFilters('tipo', value)}>
          <SelectTrigger data-testid="type-filter">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {opportunityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nivel
        </label>
        <Select value={filters.nivel} onValueChange={(value) => updateFilters('nivel', value)}>
          <SelectTrigger data-testid="level-filter">
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los niveles</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación
        </label>
        <Select value={filters.ubicacion} onValueChange={(value) => updateFilters('ubicacion', value)}>
          <SelectTrigger data-testid="location-filter">
            <SelectValue placeholder="Todas las ubicaciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las ubicaciones</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {(filters.search || filters.tipo || filters.nivel || filters.ubicacion) && (
        <Button variant="outline" onClick={clearFilters} className="w-full" data-testid="clear-filters">
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="opportunities-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Oportunidades de baloncesto
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Encuentra tu próxima oportunidad en el baloncesto español
              </p>
            </div>
            
            <Link to="/publicar">
              <Button className="hidden sm:flex bg-orange-600 hover:bg-orange-700" data-testid="publish-opportunity-btn">
                Publicar oportunidad
              </Button>
            </Link>
          </div>
          
          {/* Mobile search */}
          <div className="md:hidden">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar oportunidades..."
                value={filters.search}
                onChange={(e) => updateFilters('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full" data-testid="mobile-filters-trigger">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSection />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar filters - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtrar resultados
              </h3>
              <FilterSection />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {loading ? 'Buscando...' : `${opportunities.length} oportunidades encontradas`}
              </div>
            </div>

            {/* Results grid */}
            {loading ? (
              <div className="grid gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
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
            ) : opportunities.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron oportunidades
                </h3>
                <p className="text-gray-600 mb-4">
                  Prueba ajustando los filtros o busca con términos diferentes
                </p>
                <Button onClick={clearFilters} variant="outline" data-testid="no-results-clear-filters">
                  Limpiar filtros
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6" data-testid="opportunities-grid">
                {opportunities.map((opp) => (
                  <Card key={opp.id} className="hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getTypeColor(opp.tipo)}>
                              {getOpportunityTypeLabel(opp.tipo)}
                            </Badge>
                            {opp.verificacion && (
                              <div className="flex items-center text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Verificado</span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-2">
                            {opp.titulo}
                          </h3>
                          
                          <p className="text-gray-600 font-medium mb-2">
                            {opp.organizacion_nombre}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {opp.ubicacion}
                            </div>
                            {opp.fecha_limite && (
                              <div className="flex items-center text-orange-600">
                                <Clock className="w-4 h-4 mr-1" />
                                Hasta {new Date(opp.fecha_limite).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                          
                          {opp.remuneracion && (
                            <div className="text-sm font-medium text-green-700 mb-3">
                              {opp.remuneracion}
                            </div>
                          )}
                          
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {opp.descripcion}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <Link to={`/oportunidades/${opp.slug}`}>
                            <Button className="w-full sm:w-auto" data-testid={`opportunity-details-${opp.id}`}>
                              Ver detalles
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Mobile publish button */}
            <div className="mt-8 sm:hidden text-center">
              <Link to="/publicar">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Publicar oportunidad
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Opportunities;