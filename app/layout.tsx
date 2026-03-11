import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'
import { Footer } from '@/components/Footer'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const CookieBanner = dynamic(
  () => import('@/components/CookieBanner').then((m) => m.CookieBanner),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'WorkHoops - Tu plataforma de oportunidades de baloncesto',
  description: 'Encuentra pruebas, torneos, becas, empleos y oportunidades en el baloncesto español. Conecta el talento con las mejores ofertas.',
  keywords: 'baloncesto, oportunidades, empleo, pruebas, torneos, becas, España',
  authors: [{ name: 'WorkHoops Team' }],
  creator: 'WorkHoops',
  publisher: 'WorkHoops',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'WorkHoops - Oportunidades de baloncesto en España',
    description: 'La plataforma que conecta el talento del baloncesto con las mejores oportunidades profesionales.',
    url: process.env.APP_URL || 'http://localhost:3000',
    siteName: 'WorkHoops',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // You would add this image
        width: 1200,
        height: 630,
        alt: 'WorkHoops - Oportunidades de baloncesto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkHoops - Oportunidades de baloncesto',
    description: 'Encuentra tu próxima oportunidad en el baloncesto español',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CookieBanner />
          <Toaster 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
          <Analytics />
          <SpeedInsights />
        </NextAuthProvider>
      </body>
    </html>
  )
}
