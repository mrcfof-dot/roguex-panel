import { randomBytes } from 'crypto'

export function generateKey(prefix = 'ROGUEX'): string {
  const segments = Array.from({ length: 4 }, () =>
    randomBytes(3).toString('hex').toUpperCase().slice(0, 5)
  )
  return `${prefix}-${segments.join('-')}`
}

export function getKeyStatus(key: {
  status: string
  expires_at: string
}): 'active' | 'expired' | 'banned' {
  if (key.status === 'banned') return 'banned'
  if (new Date(key.expires_at) < new Date()) return 'expired'
  return key.status as 'active' | 'expired' | 'banned'
}

export function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const now = new Date()
  const expiry = new Date(expiresAt)
  if (isNaN(expiry.getTime())) return null

  const diffMs = expiry.getTime() - now.getTime()

  if (diffMs <= 0) return 0

  // Use Math.ceil so anything > 0 and <= 24h shows as 1 day
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '-'
  const days = Math.floor(seconds / (24 * 60 * 60))
  if (days >= 36500) return 'Lifetime'
  if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`

  if (seconds >= 60 * 60) {
    const hours = Math.floor(seconds / (60 * 60))
    return `${hours} hora${hours > 1 ? 's' : ''}`
  }

  return `${seconds} segundos`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora mesmo'

  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes < 60) return `há ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} horas`

  const days = Math.floor(hours / 24)
  return `há ${days} dias`
}
