import Link from 'next/link'
import { Mail, MapPin, Phone, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-semibold text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
)

const FooterLink = ({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) => (
  <Link 
    href={href}
    className="text-gray-400 hover:text-workhoops-accent transition-colors text-sm block"
    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
  >
    {children}
  </Link>
)

export function Footer() {
  return (
    <footer className="bg-[#121826] border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-workhoops-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-xl text-white">WorkHoops</span>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              La plataforma líder para conectar talento y oportunidades en el baloncesto español. 
              Democratizando el acceso a pruebas, empleos, torneos y becas.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-workhoops-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-workhoops-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-workhoops-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-workhoops-accent transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <FooterSection title="Plataforma">
            <FooterLink href="/oportunidades">🏀 Oportunidades</FooterLink>
            <FooterLink href="/publicar">📝 Publicar oferta</FooterLink>
            <FooterLink href="/talento">⭐ Crear perfil</FooterLink>
            <FooterLink href="/recursos">📚 Recursos</FooterLink>
            <FooterLink href="/planes">💎 Planes y precios</FooterLink>
            <FooterLink href="/dashboard">👤 Dashboard</FooterLink>
          </FooterSection>

          {/* Company Links */}
          <FooterSection title="Empresa">
            <FooterLink href="/sobre">🎯 Sobre WorkHoops</FooterLink>
            <FooterLink href="/contacto">📞 Contacto</FooterLink>
            <FooterLink href="/prensa">📰 Prensa</FooterLink>
            <FooterLink href="/carreras">💼 Únete al equipo</FooterLink>
            <FooterLink href="https://blog.workhoops.es" external>✍️ Blog</FooterLink>
          </FooterSection>

          {/* Legal & Support */}
          <FooterSection title="Legal y Soporte">
            <FooterLink href="/legal/privacidad">🔒 Privacidad</FooterLink>
            <FooterLink href="/legal/terminos">📋 Términos de uso</FooterLink>
            <FooterLink href="/legal/cookies">🍪 Política de cookies</FooterLink>
            <FooterLink href="/ayuda">❓ Centro de ayuda</FooterLink>
            <FooterLink href="/seguridad">🛡️ Seguridad</FooterLink>
          </FooterSection>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-workhoops-accent mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Email</p>
                <Link href="mailto:hola@workhoops.es" className="text-gray-600 text-sm hover:text-workhoops-accent">
                  hola@workhoops.es
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-workhoops-accent mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Teléfono</p>
                <Link href="tel:+34600000000" className="text-gray-600 text-sm hover:text-workhoops-accent">
                  +34 600 000 000
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-workhoops-accent mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Oficina</p>
                <p className="text-gray-600 text-sm">Barcelona, España</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              © 2025 WorkHoops SL. Todos los derechos reservados.
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-500">
              <span>🇪🇸 Español</span>
              <Link href="?lang=cat" className="hover:text-workhoops-accent">
                Català
              </Link>
              <span>|</span>
              <span>Hecho con ❤️ en Barcelona</span>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Aviso legal:</strong> WorkHoops actúa como intermediario de difusión entre profesionales 
                del baloncesto y organizaciones. Verificamos ofertas a nivel razonable mediante revisión manual, 
                pero el organizador es el responsable final de su contenido, veracidad y cumplimiento de la 
                legislación laboral y deportiva aplicable. No garantizamos la obtención de empleo u oportunidades 
                a través de nuestra plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}