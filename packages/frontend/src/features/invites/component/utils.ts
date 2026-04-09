export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getExpiryPercent(expiresAt: string, createdAt: string): number {
  const total = new Date(expiresAt).getTime() - new Date(createdAt).getTime()
  const remaining = new Date(expiresAt).getTime() - Date.now()
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

export function getExpiryLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const hours = Math.floor(ms / 3600000)
  if (hours < 1) {
    const mins = Math.floor(ms / 60000)
    return `${mins}m remaining`
  }
  if (hours < 24) return `${hours}h remaining`
  const days = Math.floor(hours / 24)
  return `${days}d remaining`
}
