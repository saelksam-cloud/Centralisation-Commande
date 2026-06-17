import { SupplierId, Supplier, SUPPLIERS, RestaurantId, RESTAURANTS, WeekOrder } from './types'

export function getWeekYear(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`
}

export function getWeekLabel(weekYear: string): string {
  const [yearStr, weekStr] = weekYear.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)
  const jan4 = new Date(year, 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const monday = new Date(startOfWeek1)
  monday.setDate(startOfWeek1.getDate() + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmtDay = (d: Date) =>
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return `Semaine du ${fmtDay(monday)} au ${fmtDay(sunday)}`
}

export function getNextSendDate(supplier: Supplier): Date {
  const now = new Date()
  const result = new Date(now)
  result.setHours(supplier.sendHour, 0, 0, 0)
  const currentDay = now.getDay()
  let daysUntil = (supplier.sendDayOfWeek - currentDay + 7) % 7
  if (daysUntil === 0 && now.getHours() >= supplier.sendHour) {
    daysUntil = 7
  }
  result.setDate(result.getDate() + daysUntil)
  return result
}

export function getDeliveryDate(supplier: Supplier): Date {
  const sendDate = getNextSendDate(supplier)
  const delivery = new Date(sendDate)
  delivery.setDate(delivery.getDate() + supplier.deliveryDaysAfter)
  return delivery
}

export function formatCountdown(target: Date): string {
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return 'Délai dépassé'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}j ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function generateWhatsAppMessage(
  supplierId: SupplierId,
  weekOrders: WeekOrder[],
  weekYear: string
): string {
  const supplier = SUPPLIERS[supplierId]
  const weekLabel = getWeekLabel(weekYear)

  const restaurantSections: string[] = []
  const totals: Record<string, { quantity: number; unit: string }> = {}

  const relevantRestaurants = supplier.restaurants

  for (const restId of relevantRestaurants) {
    const order = weekOrders.find(o => o.restaurantId === restId)
    const items = order ? order.items.filter(i => i.supplierId === supplierId) : []
    if (items.length === 0) continue

    const restName = RESTAURANTS[restId].name
    const lines = items.map(item => `• ${item.productName} — ${item.quantity} ${item.unit}`)
    restaurantSections.push(`🏪 ${restName.toUpperCase()}\n${lines.join('\n')}`)

    for (const item of items) {
      const key = `${item.productName}|||${item.unit}`
      if (!totals[key]) totals[key] = { quantity: 0, unit: item.unit }
      totals[key].quantity += item.quantity
    }
  }

  if (restaurantSections.length === 0) {
    return `Bonjour ${supplier.name} 👋\n\nAucune commande cette semaine.\n\nMerci 🙏`
  }

  const totalLines = Object.entries(totals).map(([key, val]) => {
    const productName = key.split('|||')[0]
    return `• ${productName} — ${val.quantity} ${val.unit}`
  })

  const weekStart = weekLabel.replace('Semaine du ', '').split(' au ')[0]

  return [
    `Bonjour ${supplier.name} 👋`,
    '',
    `Commande semaine du ${weekStart} — Groupe de restaurants`,
    '',
    restaurantSections.join('\n\n'),
    '',
    '📦 TOTAL À LIVRER :',
    totalLines.join('\n'),
    '',
    'Merci 🙏',
  ].join('\n')
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Helpers by supplierId
export function getNextSendDateById(supplierId: SupplierId): Date {
  return getNextSendDate(SUPPLIERS[supplierId])
}

export function getDeliveryDateById(supplierId: SupplierId): Date {
  return getDeliveryDate(SUPPLIERS[supplierId])
}

const DAY_NAMES_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export function getSendDateLabel(supplierId: SupplierId): string {
  const supplier = SUPPLIERS[supplierId]
  const date = getNextSendDateById(supplierId)
  const day = DAY_NAMES_FR[supplier.sendDayOfWeek]
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
  const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  return `${dayLabel} ${dateStr} avant ${supplier.sendHour}h`
}

export function openWhatsApp(supplierId: SupplierId, message: string): void {
  const number = SUPPLIERS[supplierId].whatsappNumber
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${number}?text=${encoded}`, '_blank')
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
