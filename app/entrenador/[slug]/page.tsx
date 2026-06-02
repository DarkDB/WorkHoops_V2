import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import ShareButton from '@/components/public-profile/ShareButton'
import { ProfileViewTracker } from '@/components/public-profile/ProfileViewTracker'
import { MapPin, Trophy } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

async function getCoachBySlug(slug: string) {
  const profiles = await prisma.coachProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, image: true, planType: true }
      }
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
  const profile = await getCoachBySlug(params.slug)
  if (!profile) return { title: 'Entrenador no encontrado | WorkHoops' }

  const expText = profile.totalExperience ? ` con ${profile.totalExperience} años de experiencia` : ''
  const cityText = profile.city ? ` en ${profile.city}` : ''

  return {
    title: `${profile.fullName} — Entrenador de baloncesto | WorkHoops`,
    description: `Perfil de ${profile.fullName}, entrenador de baloncesto${expText}${cityText}. Ver trayectoria y contactar.`,
    openGraph: {
      title: `${profile.fullName} — WorkHoops`,
      description: `Entrenador de baloncesto${expText}`,
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

export default async function EntrenadorPublicPage({ params }: PageProps) {
  const profile = await getCoachBySlug(params.slug)

  if (!profile) {
    notFound()
  }

  const categoriesCoached = parseJsonField(profile.categoriesCoached)
  const isPro = profile.user.planType === 'pro_semipro'
  const firstName = profile.fullName.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileViewTracker profileUserId={profile.user.id} profileType="entrenador" />
      {/* Hero Section */}
      <div className="bg-[#0f0f1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FF6B1A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FF6B1A 0%, transparent 40%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-10 sm:py-14">
          {/* Share button */}
          <div className="flex justify-end mb-6">
            <ShareButton />
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#FF6B1A] to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{profile.fullName}</h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <span className="bg-[#FF6B1A] text-white text-sm font-semibold px-3 py-1 rounded-full">
                Entrenador
              </span>
              {profile.currentLevel && (
                <span className="bg-white/15 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {profile.currentLevel}
                </span>
              )}
              {isPro && (
                <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full">
                  ★ Pro
                </span>
              )}
            </div>

            {/* Location */}
            {(profile.city || profile.nationality) && (
              <p className="text-gray-300 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {[profile.city, profile.nationality].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Stats chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {profile.totalExperience && (
              <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                📅 {profile.totalExperience} años exp.
              </span>
            )}
            {profile.currentClub && (
              <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                🏀 {profile.currentClub}
              </span>
            )}
            {profile.federativeLicense && (
              <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                🏅 {profile.federativeLicense}
              </span>
            )}
            {profile.internationalExp && (
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

        {/* Filosofía */}
        {profile.playingStyle && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Filosofía de juego</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.playingStyle}</p>
          </div>
        )}

        {/* Categorías entrenadas */}
        {categoriesCoached.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Categorías entrenadas</h2>
            <div className="flex flex-wrap gap-2">
              {categoriesCoached.map((cat) => (
                <span
                  key={cat}
                  className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Logros */}
        {profile.achievements && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Logros destacados</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.achievements}</p>
          </div>
        )}

        {/* Formación */}
        {(profile.federativeLicense || profile.academicDegrees || profile.certifications) && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Formación</h2>
            <div className="space-y-2">
              {profile.federativeLicense && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Licencia federativa:</span> {profile.federativeLicense}
                </p>
              )}
              {profile.academicDegrees && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Titulación:</span> {profile.academicDegrees}
                </p>
              )}
              {profile.certifications && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Certificaciones:</span> {profile.certifications}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Video */}
        {profile.videoUrl && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Video de presentación</h2>
            <a
              href={profile.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              ▶ Ver presentación
            </a>
          </div>
        )}

        {/* CTA for clubs */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 sm:p-8 text-center">
          <Trophy className="w-8 h-8 text-[#FF6B1A] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ¿Buscas entrenador? Contacta con {firstName}
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Regístrate gratis para enviar un mensaje directo a este entrenador
          </p>
          <Link
            href={`/auth/register?redirect=/entrenador/${params.slug}`}
            className="inline-block bg-[#FF6B1A] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
          >
            Contactar con este entrenador →
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
