'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, Trophy, Share2 } from 'lucide-react'

export interface ChecklistItem {
  id: string
  label: string
  completed: boolean
  ctaLabel: string
  ctaHref: string
}

interface ActivationChecklistProps {
  items: ChecklistItem[]
  role: string
  profileSlug: string
}

export default function ActivationChecklist({ items, role, profileSlug }: ActivationChecklistProps) {
  const [localCompleted, setLocalCompleted] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  // Load localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`checklist_${role}_${profileSlug}`)
    if (stored) {
      try {
        setLocalCompleted(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [role, profileSlug])

  const mergedItems = items.map((item) => ({
    ...item,
    completed: item.completed || !!localCompleted[item.id],
  }))

  const completedCount = mergedItems.filter((i) => i.completed).length
  const totalCount = mergedItems.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)
  const allDone = completedCount === totalCount

  if (allDone) {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <Trophy className="w-6 h-6 text-green-600 shrink-0" />
        <p className="text-sm font-semibold text-green-800">
          Perfil completo — ¡Los clubes pueden encontrarte!
        </p>
      </div>
    )
  }

  const handleShareClick = () => {
    const baseUrl = window.location.origin
    const rolePrefix = role === 'jugador' ? 'jugador' : role === 'entrenador' ? 'entrenador' : 'club'
    const url = `${baseUrl}/${rolePrefix}/${profileSlug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      const next = { ...localCompleted, share: true }
      setLocalCompleted(next)
      localStorage.setItem(`checklist_${role}_${profileSlug}`, JSON.stringify(next))
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900">Completa tu perfil 🏀</h3>
        <p className="text-sm text-gray-500">Aparece en más búsquedas de clubes</p>
      </div>

      {/* Progress bar */}
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>{completedCount} de {totalCount} completados</span>
        <span className="font-medium text-orange-500">{progressPercent}%</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {progressPercent >= 80 && progressPercent < 100 && (
        <p className="text-xs text-orange-600 font-medium mb-3">
          ¡Casi listo! Un perfil completo recibe 3x más visitas
        </p>
      )}

      {/* Items */}
      <ul className="space-y-2">
        {mergedItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 shrink-0" />
              )}
              <span
                className={`text-sm truncate ${
                  item.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                }`}
              >
                {item.label}
              </span>
            </div>

            {!item.completed && item.ctaLabel && (
              item.id === 'share' ? (
                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600 border border-orange-200 rounded px-2 py-0.5 shrink-0 transition-colors"
                >
                  <Share2 className="w-3 h-3" />
                  {copied ? '¡Copiado!' : item.ctaLabel}
                </button>
              ) : (
                <Link
                  href={item.ctaHref}
                  className="text-xs font-medium text-orange-500 hover:text-orange-600 border border-orange-200 rounded px-2 py-0.5 shrink-0 transition-colors"
                >
                  {item.ctaLabel}
                </Link>
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
