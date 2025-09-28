import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, MapPin, Briefcase, Users, BookOpen, Phone, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/', icon: null },
    { name: 'Oportunidades', href: '/oportunidades', icon: Briefcase },
    { name: 'Publicar', href: '/publicar', icon: Crown },
    { name: 'Talento', href: '/talento', icon: Users },
    { name: 'Recursos', href: '/recursos', icon: BookOpen },
    { name: 'Precios', href: '/precios', icon: null },
    { name: 'Contacto', href: '/contacto', icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  const Logo = () => (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">W</span>
      </div>
      <span className="text-xl font-bold text-gray-900">WorkHoops</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Search and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              data-testid="search-button"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Link to="/auth">
              <Button variant="outline" size="sm" data-testid="login-button">
                <User className="w-4 h-4 mr-2" />
                Acceder
              </Button>
            </Link>
            <Link to="/publicar">
              <Button className="bg-orange-600 hover:bg-orange-700" size="sm" data-testid="publish-cta">
                Publicar oferta
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <Logo />
                  <div className="border-t pt-4">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                            isActive(item.href)
                              ? 'text-orange-600 bg-orange-50'
                              : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                          }`}
                          onClick={() => setIsOpen(false)}
                          data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                        >
                          {Icon && <Icon className="w-5 h-5" />}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start" data-testid="mobile-login">
                        <User className="w-4 h-4 mr-2" />
                        Acceder
                      </Button>
                    </Link>
                    <Link to="/publicar" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="mobile-publish">
                        Publicar oferta
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;