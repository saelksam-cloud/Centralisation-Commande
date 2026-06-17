export function getWeekYear(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

export function getNextDeadline(dayOfWeek: number): Date {
  // dayOfWeek: 0=Sunday, 5=Friday, 3=Wednesday
  const now = new Date()
  const result = new Date(now)
  const currentDay = now.getDay()
  let daysUntil = dayOfWeek - currentDay
  if (daysUntil <= 0) daysUntil += 7
  result.setDate(now.getDate() + daysUntil)
  result.setHours(12, 0, 0, 0)
  return result
}

export function formatCountdown(deadline: Date): string {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  if (diff <= 0) return 'Délai dépassé'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}j ${hours}h`
  return `${hours}h`
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function exportToCSV(data: Array<Record<string, unknown>>, filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
