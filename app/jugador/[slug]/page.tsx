import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import ShareButton from '@/components/public-profile/ShareButton'
import { ProfileViewTracker } from '@/components/public-profile/ProfileViewTracker'
import { MapPin, Trophy, Globe } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

async function getPlayerBySlug(slug: string) {
  const profiles = await prisma.talentProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, image: true, planType: true }
      },
      playerSkills: true
    },
    where: { isPublic: true }
  })

  return profiles.find(p => {
    const byFullName = generateSlug(p.fullName) === slug
    const withId = generateSlug(p.fullName) + '-' + p.userId.slice(-6) === slug
    return byFullName || withId
  }) || null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getPlayerBySlug(params.slug)
  if (!profile) return { title: 'Jugador no encontrado | WorkHoops' }

  const heightText = profile.height ? `, ${(profile.height / 100).toFixed(2).replace('.', '.')}m` : ''
  const cityText = profile.city ? ` buscando equipo en ${profile.city}` : ''
  const positionText = profile.position ? `, ${profile.position}` : ''

  return {
    title: `${profile.fullName} — Jugador de baloncesto | WorkHoops`,
    description: `Perfil de ${profile.fullName}${positionText}${heightText}${cityText}. Ver estadísticas y contactar.`,
    openGraph: {
      title: `${profile.fullName} — WorkHoops`,
      description: `Jugador de baloncesto${positionText}${heightText}`,
      images: ['/og-image.svg'],
      type: 'profile'
    }
  }
}

function parseJsonField(field: string | null): string[] {
  if (!field) return []
  try {
    const parsed = JSON.parse(field)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const POSITION_LABELS: Record<string, string> = {
  base: 'Base', Base: 'Base',
  escolta: 'Escolta', Escolta: 'Escolta',
  alero: 'Alero', Alero: 'Alero',
  'ala-pivot': 'Ala-Pívot', 'Ala-pívot': 'Ala-Pívot',
  pivot: 'Pívot', Pívot: 'Pívot'
}

export default async function JugadorPublicPage({ params }: PageProps) {
  const profile = await getPlayerBySlug(params.slug)

  if (!profile) {
    notFound()
  }

  const playingStyles = parseJsonField(profile.playingStyle)
  const isPro = profile.user.planType === 'pro_semipro'
  const firstName = profile.fullName.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileViewTracker profileUserId={profile.user.id} profileType="jugador" />
      {/* Hero Section */}
      <div className="bg-[#0f0f1a] text-white relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FF6B1A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FF6B1A 0%, transparent 40%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-10 sm:py-14">
          {/* Share button top right */}
          <div className="flex justify-end mb-6">
            <ShareButton />
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#FF6B1A] to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4 flex-shrink-0">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{profile.fullName}</h1>

            {/* Badges row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {profile.position && (
                <span className="bg-[#FF6B1A] text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {POSITION_LABELS[profile.position] || profile.position}
                </span>
              )}
              {profile.availabilityStatus === 'AVAILABLE' && (
                <span className="bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  Disponible
                </span>
              )}
              {profile.availabilityStatus === 'OPEN_TO_OFFERS' && (
                <span className="bg-yellow-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  Abierto a ofertas
                </span>
              )}
              {isPro && (
                <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full">
                  ★ Pro
                </span>
              )}
            </div>

            {/* Location */}
            {(profile.city || profile.country) && (
              <p className="text-gray-300 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Stats chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {profile.height && (
              <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                📏 {(profile.height / 100).toFixed(2).replace('.', '.')}m
              </span>
            )}
            {profile.currentLevel && (
              <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                🏆 {profile.currentLevel}
              </span>
            )}
            {profile.lastTeam && (
              <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                🏀 {profile.lastTeam}
              </span>
            )}
            {profile.internationalExperience && (
              <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                🌍 Exp. Internacional
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre mí</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Position info */}
        {(profile.position || profile.secondaryPosition) && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Posición</h2>
            <div className="flex flex-wrap gap-2">
              {profile.position && (
                <span className="bg-orange-100 text-orange-800 font-semibold px-3 py-1 rounded-full text-sm">
                  {POSITION_LABELS[profile.position] || profile.position} (Principal)
                </span>
              )}
              {profile.secondaryPosition && profile.secondaryPosition !== 'none' && (
                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm border border-orange-200">
                  {POSITION_LABELS[profile.secondaryPosition] || profile.secondaryPosition} (Secundaria)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Playing style */}
        {playingStyles.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Estilo de juego</h2>
            <div className="flex flex-wrap gap-2">
              {playingStyles.map((style) => (
                <span
                  key={style}
                  className="bg-[#FF6B1A] text-white text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {profile.videoUrl && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Video de highlights</h2>
            <a
              href={profile.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              ▶ Ver highlights
            </a>
          </div>
        )}

        {/* CTA for clubs */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 sm:p-8 text-center">
          <Trophy className="w-8 h-8 text-[#FF6B1A] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ¿Eres un club interesado en {firstName}?
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Regístrate gratis para enviar un mensaje directo a este jugador
          </p>
          <Link
            href={`/auth/register?redirect=/jugador/${params.slug}`}
            className="inline-block bg-[#FF6B1A] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
          >
            Contactar con este jugador →
          </Link>
          <p className="text-xs text-gray-400 mt-3">Sin compromisos. Gratis para clubes.</p>
        </div>

        {/* Footer link */}
        <div className="text-center pb-6">
          <p className="text-sm text-gray-400">
            Perfil creado en{' '}
            <Link href="/" className="text-[#FF6B1A] font-semibold hover:underline">
              WorkHoops
            </Link>
            {' '}— La plataforma de baloncesto
          </p>
        </div>
      </div>
    </div>
  )
}
