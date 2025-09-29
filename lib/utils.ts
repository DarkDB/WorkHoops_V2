import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const rtf = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' })
  
  const diffInSeconds = (dateObj.getTime() - Date.now()) / 1000
  const diffInMinutes = diffInSeconds / 60
  const diffInHours = diffInMinutes / 60
  const diffInDays = diffInHours / 24
  
  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(Math.round(diffInDays), 'day')
  } else if (Math.abs(diffInHours) >= 1) {
    return rtf.format(Math.round(diffInHours), 'hour')
  } else {
    return rtf.format(Math.round(diffInMinutes), 'minute')
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getOpportunityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    empleo: 'Empleo',
    prueba: 'Prueba',
    torneo: 'Torneo',
    clinica: 'Clínica',
    beca: 'Beca',
    patrocinio: 'Patrocinio',
  }
  return labels[type] || type
}

export function getOpportunityLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    amateur: 'Amateur',
    semi_pro: 'Semi-profesional',
    cantera: 'Cantera',
    pro: 'Profesional',
  }
  return labels[level] || level
}

export function getApplicationStateLabel(state: string): string {
  const labels: Record<string, string> = {
    enviada: 'Enviada',
    vista: 'Vista',
    rechazada: 'Rechazada',
    aceptada: 'Aceptada',
  }
  return labels[state] || state
}

export function getApplicationStateColor(state: string): string {
  const colors: Record<string, string> = {
    enviada: 'bg-blue-100 text-blue-800',
    vista: 'bg-yellow-100 text-yellow-800',
    rechazada: 'bg-red-100 text-red-800',
    aceptada: 'bg-green-100 text-green-800',
  }
  return colors[state] || 'bg-gray-100 text-gray-800'
}

export function getOpportunityTypeColor(type: string): string {
  const colors: Record<string, string> = {
    empleo: 'bg-green-100 text-green-800',
    prueba: 'bg-blue-100 text-blue-800',
    torneo: 'bg-purple-100 text-purple-800',
    clinica: 'bg-indigo-100 text-indigo-800',
    beca: 'bg-orange-100 text-orange-800',
    patrocinio: 'bg-pink-100 text-pink-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}