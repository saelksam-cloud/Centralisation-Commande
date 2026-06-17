'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useOrders } from '@/hooks/useOrders'
import {
  SUPPLIERS, RESTAURANTS, CATALOG_PRODUCTS, UNITS,
  SupplierId, RestaurantId, WeekOrder, OrderItem
} from '@/lib/types'
import {
  getWeekYear, getNextSendDate, getDeliveryDate,
  formatCountdown, formatDate, generateWhatsAppMessage, getWeekLabel
} from '@/lib/utils'

function getVisibleSuppliers(user: string): SupplierId[] {
  return (Object.keys(SUPPLIERS) as SupplierId[]).filter(sid => {
    if (user === 'manager') return true
    return SUPPLIERS[sid].restaurants.includes(user as RestaurantId)
  })
}

function AddItemModal({
  supplierId,
  restaurantId,
  onAdd,
  onClose,
}: {
  supplierId: SupplierId
  restaurantId: RestaurantId
  onAdd: (item: Omit<OrderItem, 'id'>) => void
  onClose: () => void
}) {
  const supplierProducts = CATALOG_PRODUCTS.filter(p => p.supplierId === supplierId)
  const categories = [...new Set(supplierProducts.map(p => p.category))]

  const [productName, setProductName] = useState('')
  const [unit, setUnit] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === '__custom__') {
      setIsCustom(true)
      setProductName('')
      setUnit('')
      setCategory('')
    } else {
      const product = supplierProducts.find(p => p.id === val)
      if (product) {
        setIsCustom(false)
        setProductName(product.name)
        setUnit(product.unit)
        setCategory(product.category)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName.trim() || quantity <= 0) return
    onAdd({
      productName: productName.trim(),
      quantity,
      unit,
      supplierId,
      category: category || 'Autre',
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Ajouter un article</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleProductSelect}
              defaultValue=""
            >
              <option value="" disabled>Choisir un produit...</option>
              {categories.map(cat => (
                <optgroup key={cat} label={cat}>
                  {supplierProducts.filter(p => p.category === cat).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
              ))}
              <option value="__custom__">— Saisie libre —</option>
            </select>
          </div>

          {isCustom && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
              <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Perrier 50cl"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choisir...</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: urgente, substitution..."
            />
          </div>

          <button
            type="submit"
            disabled={!productName.trim()}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: SUPPLIERS[supplierId].color }}
          >
            Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}

function CountdownTimer({ supplierId }: { supplierId: SupplierId }) {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const supplier = SUPPLIERS[supplierId]
  const sendDate = getNextSendDate(supplier)
  const deliveryDate = getDeliveryDate(supplier)
  const countdown = formatCountdown(sendDate)

  const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const sendDayName = DAY_NAMES[supplier.sendDayOfWeek]

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Envoi prévu</p>
          <p className="text-sm font-medium text-gray-900">
            {sendDayName} {formatDate(sendDate)} avant {supplier.sendHour}h
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Livraison estimée : {formatDate(deliveryDate)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500 mb-0.5">Dans</p>
          <p
            className="text-xl font-bold"
            style={{ color: supplier.color }}
          >
            {countdown}
          </p>
        </div>
      </div>
    </div>
  )
}

function SupplierTabContent({
  supplierId,
  weekOrders,
  currentUser,
  weekYear,
  onAddItem,
  onDeleteItem,
}: {
  supplierId: SupplierId
  weekOrders: WeekOrder[]
  currentUser: string
  weekYear: string
  onAddItem: (supplierId: SupplierId) => void
  onDeleteItem: (restaurantId: RestaurantId, itemId: string) => void
}) {
  const supplier = SUPPLIERS[supplierId]
  const [copied, setCopied] = useState(false)

  const isManager = currentUser === 'manager'
  const myRestaurantId = isManager ? null : currentUser as RestaurantId

  const relevantRestaurants = supplier.restaurants

  const rows: { restaurantId: RestaurantId; items: OrderItem[] }[] = relevantRestaurants.map(rid => {
    const order = weekOrders.find(o => o.restaurantId === rid)
    const items = order ? order.items.filter(i => i.supplierId === supplierId) : []
    return { restaurantId: rid, items }
  })

  const totals: Record<string, { productName: string; quantity: number; unit: string }> = {}
  for (const row of rows) {
    for (const item of row.items) {
      const key = `${item.productName}|||${item.unit}`
      if (!totals[key]) totals[key] = { productName: item.productName, quantity: 0, unit: item.unit }
      totals[key].quantity += item.quantity
    }
  }
  const totalEntries = Object.values(totals)

  const message = generateWhatsAppMessage(supplierId, weekOrders, weekYear)
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${supplier.whatsappNumber}?text=${encodedMessage}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const hasAnyItems = rows.some(r => r.items.length > 0)

  const flatRows: { restaurantId: RestaurantId; item: OrderItem; isFirstForRestaurant: boolean }[] = []
  for (const { restaurantId, items } of rows) {
    items.forEach((item, idx) => {
      flatRows.push({ restaurantId, item, isFirstForRestaurant: idx === 0 })
    })
  }

  return (
    <div>
      <CountdownTimer supplierId={supplierId} />

      <div className="flex gap-2 mb-4">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Envoyer sur WhatsApp
        </a>
        <button
          onClick={handleCopy}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
          style={{
            borderColor: supplier.color,
            color: copied ? 'white' : supplier.color,
            backgroundColor: copied ? supplier.color : 'transparent',
          }}
        >
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>

      {!hasAnyItems ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Aucun article commandé cette semaine
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Restaurant</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Produit</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Qté</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Unité</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Notes</th>
                {!isManager && <th className="px-3 py-2.5 w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {flatRows.map(({ restaurantId, item, isFirstForRestaurant }) => {
                const isMyRestaurant = restaurantId === myRestaurantId
                const rest = RESTAURANTS[restaurantId]
                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-0"
                    style={isMyRestaurant ? { backgroundColor: `${rest.color}10` } : {}}
                  >
                    <td className="px-3 py-2 font-medium" style={{ color: isFirstForRestaurant ? rest.color : 'transparent' }}>
                      {isFirstForRestaurant ? rest.name : ''}
                    </td>
                    <td className="px-3 py-2 text-gray-900">{item.productName}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{item.quantity}</td>
                    <td className="px-3 py-2 text-gray-600">{item.unit}</td>
                    <td className="px-3 py-2 text-gray-400 hidden sm:table-cell">{item.notes}</td>
                    {!isManager && (
                      <td className="px-3 py-2">
                        {isMyRestaurant && (
                          <button
                            onClick={() => onDeleteItem(restaurantId, item.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
                            title="Supprimer"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
              {totalEntries.length > 0 && (
                <>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={isManager ? 5 : 6} className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total à livrer
                    </td>
                  </tr>
                  {totalEntries.map(t => (
                    <tr key={`${t.productName}-${t.unit}`} className="bg-gray-50">
                      <td className="px-3 py-2 text-xs font-medium text-gray-700" colSpan={2}>{t.productName}</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-900">{t.quantity}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{t.unit}</td>
                      <td className="px-3 py-2 hidden sm:table-cell"></td>
                      {!isManager && <td className="px-3 py-2"></td>}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isManager && myRestaurantId && SUPPLIERS[supplierId].restaurants.includes(myRestaurantId) && (
        <button
          onClick={() => onAddItem(supplierId)}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-colors"
          style={{ borderColor: supplier.color, color: supplier.color }}
        >
          + Ajouter un article
        </button>
      )}
    </div>
  )
}

export default function CommandesPage() {
  const { user, loaded } = useUser()
  const router = useRouter()
  const { addItem, deleteItem, getCurrentWeekOrders } = useOrders()

  const weekYear = getWeekYear()
  const [activeTab, setActiveTab] = useState<SupplierId | null>(null)
  const [addModalSupplier, setAddModalSupplier] = useState<SupplierId | null>(null)

  useEffect(() => {
    if (loaded && !user) router.replace('/')
  }, [loaded, user, router])

  const visibleSuppliers = user ? getVisibleSuppliers(user) : []

  useEffect(() => {
    if (visibleSuppliers.length > 0 && !activeTab) {
      setActiveTab(visibleSuppliers[0])
    }
  }, [visibleSuppliers.length, activeTab])

  if (!loaded || !user) return null

  const weekOrders = getCurrentWeekOrders(weekYear)

  const getBadgeCount = (sid: SupplierId) => {
    return weekOrders.reduce((acc, o) => acc + o.items.filter(i => i.supplierId === sid).length, 0)
  }

  const handleAddItem = (supplierId: SupplierId) => {
    setAddModalSupplier(supplierId)
  }

  const handleConfirmAdd = (item: Omit<OrderItem, 'id'>) => {
    if (!user || user === 'manager') return
    addItem(user as RestaurantId, item)
  }

  const handleDeleteItem = (restaurantId: RestaurantId, itemId: string) => {
    deleteItem(restaurantId, itemId)
  }

  const weekLabel = getWeekLabel(weekYear)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <p className="text-xs text-gray-400 text-center mb-4">{weekLabel}</p>

        <div className="flex overflow-x-auto gap-1 mb-4 pb-1">
          {visibleSuppliers.map(sid => {
            const supplier = SUPPLIERS[sid]
            const count = getBadgeCount(sid)
            const isActive = activeTab === sid
            return (
              <button
                key={sid}
                onClick={() => setActiveTab(sid)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={isActive
                  ? { backgroundColor: supplier.color, color: 'white' }
                  : { backgroundColor: 'white', color: supplier.color, border: `1.5px solid ${supplier.color}` }
                }
              >
                {supplier.name}
                {count > 0 && (
                  <span
                    className="text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    style={isActive
                      ? { backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }
                      : { backgroundColor: supplier.color, color: 'white' }
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {activeTab && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: SUPPLIERS[activeTab].color }}
                >
                  {SUPPLIERS[activeTab].name}
                </h2>
                <p className="text-xs text-gray-400">{SUPPLIERS[activeTab].description}</p>
              </div>
            </div>
            <SupplierTabContent
              supplierId={activeTab}
              weekOrders={weekOrders}
              currentUser={user}
              weekYear={weekYear}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        )}
      </div>

      {addModalSupplier && user && user !== 'manager' && (
        <AddItemModal
          supplierId={addModalSupplier}
          restaurantId={user as RestaurantId}
          onAdd={handleConfirmAdd}
          onClose={() => setAddModalSupplier(null)}
        />
      )}
    </div>
  )
}
