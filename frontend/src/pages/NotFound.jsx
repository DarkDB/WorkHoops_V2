import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto" data-testid="not-found-page">
        <div className="mb-8">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-orange-600">404</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Página no encontrada
          </h1>
          <p className="text-gray-600">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/" className="block">
            <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="home-button">
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
          
          <Link to="/oportunidades" className="block">
            <Button variant="outline" className="w-full" data-testid="opportunities-button">
              <Search className="w-4 h-4 mr-2" />
              Explorar oportunidades
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <Link to="/contacto" className="text-orange-600 hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;