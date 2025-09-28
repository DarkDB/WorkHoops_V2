import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    plataforma: [
      { name: 'Oportunidades', href: '/oportunidades' },
      { name: 'Publicar oferta', href: '/publicar' },
      { name: 'Crear perfil', href: '/talento' },
      { name: 'Precios', href: '/precios' },
    ],
    recursos: [
      { name: 'Blog', href: '/recursos' },
      { name: 'Guías', href: '/recursos?categoria=guias' },
      { name: 'Consejos', href: '/recursos?categoria=consejos' },
      { name: 'Centro de ayuda', href: '/contacto' },
    ],
    empresa: [
      { name: 'Sobre nosotros', href: '/sobre' },
      { name: 'Contacto', href: '/contacto' },
      { name: 'Prensa', href: '/sobre#prensa' },
      { name: 'Partners', href: '/sobre#partners' },
    ],
    legal: [
      { name: 'Privacidad', href: '/privacidad' },
      { name: 'Términos', href: '/terminos' },
      { name: 'Cookies', href: '/privacidad#cookies' },
      { name: 'RGPD', href: '/privacidad#rgpd' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300" data-testid="footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-white">WorkHoops</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              La plataforma que conecta el talento del baloncesto español con las mejores oportunidades. 
              Encuentra tu próximo salto profesional.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/workhoops" 
                className="text-gray-400 hover:text-orange-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="twitter-link"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/workhoops" 
                className="text-gray-400 hover:text-orange-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="instagram-link"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/workhoops" 
                className="text-gray-400 hover:text-orange-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="linkedin-link"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:hola@workhoops.es" 
                className="text-gray-400 hover:text-orange-500 transition-colors"
                data-testid="email-link"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links sections */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:col-span-4">
            <div>
              <h3 className="text-white font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-3">
                {footerLinks.plataforma.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                      data-testid={`footer-link-${link.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Recursos</h3>
              <ul className="space-y-3">
                {footerLinks.recursos.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                      data-testid={`footer-link-${link.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Empresa</h3>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                      data-testid={`footer-link-${link.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                      data-testid={`footer-link-${link.name.toLowerCase()}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Barcelona, España</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <span>hola@workhoops.es</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>🇪🇸 ES</span>
              <span className="text-gray-600">|</span>
              <button className="hover:text-orange-500 transition-colors">🇪🇸 CAT</button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} WorkHoops. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-500">
              Verificamos ofertas manualmente. RGPD compliant. 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;