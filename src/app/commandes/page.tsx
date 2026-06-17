'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useOrders } from '@/hooks/useOrders'
import {
  SUPPLIERS, RESTAURANTS, CATALOG_PRODUCTS as CATALOG, UNITS,
  SupplierId, RestaurantId, OrderItem, Product
} from '@/lib/types'
import {
  getWeekYear, getWeekLabel, getNextSendDateById as getNextSendDate, getDeliveryDateById as getDeliveryDate,
  formatCountdown, formatDate, getSendDateLabel,
  generateWhatsAppMessage, openWhatsApp, copyToClipboard
} from '@/lib/utils'

const SUPPLIER_IDS = Object.keys(SUPPLIERS) as SupplierId[]
const EMPTY_FORM = { productName: '', quantity: 1, unit: 'bouteille', category: '', notes: '' }

function CountdownBadge({ supplierId }: { supplierId: SupplierId }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60000)
    return () => clearInterval(t)
  }, [])
  const sendDate = getNextSendDate(supplierId)
  const deliveryDate = getDeliveryDate(supplierId)
  const supplier = SUPPLIERS[supplierId]
  const countdown = formatCountdown(sendDate)
  const isUrgent = sendDate.getTime() - Date.now() < 24 * 3600 * 1000

  return (
    <div className="rounded-xl p-4 text-white mb-4" style={{ backgroundColor: supplier.color }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium opacity-80 mb-1">📅 Envoi</div>
          <div className="font-semibold text-sm">{getSendDateLabel(supplierId)}</div>
          <div className="text-xs opacity-75 mt-1">📦 Livraison estimée : {formatDate(deliveryDate)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80 mb-1">Délai restant</div>
          <div className={`text-2xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>{countdown}</div>
          {isUrgent && <div className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full">⚠️ Urgent</div>}
        </div>
      </div>
    </div>
  )
}

function WhatsAppSection({ supplierId, weekYear }: { supplierId: SupplierId; weekYear: string }) {
  const { getCurrentWeekOrders } = useOrders()
  const [copied, setCopied] = useState(false)
  const supplier = SUPPLIERS[supplierId]

  const weekOrders = getCurrentWeekOrders(weekYear)
  const message = generateWhatsAppMessage(supplierId, weekOrders, weekYear)
  const totalItems = weekOrders.flatMap(o => o.items.filter(i => i.supplierId === supplierId)).length

  const handleCopy = async () => {
    await copyToClipboard(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-gray-800">Message {supplier.name}</div>
          <div className="text-xs text-gray-500">{totalItems} article{totalItems !== 1 ? 's' : ''} au total sur les 4 restaurants</div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            {copied ? '✅ Copié !' : '📋 Copier'}
          </button>
          <button onClick={() => openWhatsApp(supplierId, message)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#25D366' }}>
            <span>WhatsApp</span>
            <span className="text-base">📱</span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface AddItemModalProps {
  supplierId: SupplierId
  restaurantId: RestaurantId
  onClose: () => void
  onAdd: (item: Omit<OrderItem, 'id'>) => void
}

function AddItemModal({ supplierId, restaurantId, onClose, onAdd }: AddItemModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const supplier = SUPPLIERS[supplierId]
  const restaurant = RESTAURANTS[restaurantId]
  const catalogProducts = CATALOG.filter(p => p.supplierId === supplierId)
  const byCategory = catalogProducts.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {} as Record<string, Product[]>)

  const handleCatalogSelect = (productName: string) => {
    const p = catalogProducts.find(c => c.name === productName)
    if (p) setForm(f => ({ ...f, productName: p.name, unit: p.unit, category: p.category }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productName || form.quantity <= 0) return
    onAdd({ ...form, supplierId })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Ajouter un article</h3>
            <div className="text-xs text-gray-500 mt-0.5">
              <span style={{ color: restaurant.color }}>● {restaurant.name}</span>
              {' → '}
              <span style={{ color: supplier.color }}>● {supplier.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Choisir dans le catalogue</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value="" onChange={e => handleCatalogSelect(e.target.value)}>
              <option value="">— Sélectionner un produit —</option>
              {Object.entries(byCategory).map(([cat, products]) => (
                <optgroup key={cat} label={cat}>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Produit *</label>
            <input required type="text" value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
              placeholder="Nom du produit"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': supplier.color } as React.CSSProperties} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantité *</label>
              <input required type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unité</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optionnel)</label>
            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Précision, variante..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: supplier.color }}>
              Ajouter
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CommandesPage() {
  const { user, loaded: userLoaded } = useUser()
  const { orders, loaded: ordersLoaded, addItem, deleteItem, getCurrentWeekOrders } = useOrders()
  const router = useRouter()

  const [activeSupplier, setActiveSupplier] = useState<SupplierId | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [weekYear] = useState(getWeekYear())

  useEffect(() => {
    if (userLoaded && (!user || user === 'manager')) router.push(user === 'manager' ? '/manager' : '/')
  }, [userLoaded, user, router])

  useEffect(() => {
    if (user && user !== 'manager') {
      const available = SUPPLIER_IDS.filter(sid => SUPPLIERS[sid].restaurants.includes(user as RestaurantId))
      if (available.length > 0 && !activeSupplier) setActiveSupplier(available[0])
    }
  }, [user, activeSupplier])

  if (!userLoaded || !ordersLoaded || !user || user === 'manager') return null

  const restaurantId = user as RestaurantId
  const restaurant = RESTAURANTS[restaurantId]
  const weekOrders = getCurrentWeekOrders(weekYear)

  const availableSuppliers = SUPPLIER_IDS.filter(sid => SUPPLIERS[sid].restaurants.includes(restaurantId))

  const getItemCount = (sid: SupplierId) =>
    weekOrders.flatMap(o => o.items.filter(i => i.supplierId === sid)).length

  const myOrder = weekOrders.find(o => o.restaurantId === restaurantId)
  const myItemsForSupplier = myOrder?.items.filter(i => i.supplierId === activeSupplier) || []

  // All restaurants' items for active supplier
  const restaurantIds: RestaurantId[] = ['tadao', 'malman', 'terrasse', 'itaca']

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
      {/* Week header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">
          <span style={{ color: restaurant.color }}>● {restaurant.name}</span>
          <span className="font-normal text-gray-500 text-sm ml-2">— Semaine du {getWeekLabel(weekYear)}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Vous voyez les commandes de tous les restaurants en temps réel</p>
      </div>

      {/* Supplier tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {availableSuppliers.map(sid => {
          const supplier = SUPPLIERS[sid]
          const count = getItemCount(sid)
          const isActive = activeSupplier === sid
          return (
            <button key={sid} onClick={() => setActiveSupplier(sid)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive ? 'text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={isActive ? { backgroundColor: supplier.color } : {}}>
              <span>{supplier.name}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white/30' : 'bg-gray-100 text-gray-600'}`}
                  style={isActive ? { color: supplier.color } : {}}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeSupplier && (
        <>
          {/* Countdown + delivery */}
          <CountdownBadge supplierId={activeSupplier} />

          {/* WhatsApp */}
          <WhatsAppSection supplierId={activeSupplier} weekYear={weekYear} />

          {/* All restaurants view */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">
                Commandes de la semaine — {SUPPLIERS[activeSupplier].name}
              </h2>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: SUPPLIERS[activeSupplier].color }}>
                + Ajouter
              </button>
            </div>

            {restaurantIds
              .filter(rId => SUPPLIERS[activeSupplier].restaurants.includes(rId))
              .map(rId => {
                const rOrder = weekOrders.find(o => o.restaurantId === rId)
                const rItems = rOrder?.items.filter(i => i.supplierId === activeSupplier) || []
                const r = RESTAURANTS[rId]
                const isMe = rId === restaurantId

                return (
                  <div key={rId} className={`border-b border-gray-50 last:border-b-0 ${isMe ? 'bg-orange-50' : ''}`}
                    style={isMe ? { backgroundColor: `${restaurant.color}10` } : {}}>
                    <div className="flex items-center gap-2 px-4 py-2.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="font-medium text-sm text-gray-800">{r.name}</span>
                      {isMe && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Vous</span>}
                      <span className="text-xs text-gray-400 ml-auto">{rItems.length} article{rItems.length !== 1 ? 's' : ''}</span>
                    </div>

                    {rItems.length > 0 ? (
                      <div className="pb-2">
                        {rItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between px-4 py-1.5 hover:bg-black/5 group">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-800">{item.productName}</span>
                              {item.notes && <span className="text-xs text-gray-400 ml-2">· {item.notes}</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              <span className="text-sm font-medium text-gray-700">{item.quantity} <span className="text-gray-400 font-normal">{item.unit}</span></span>
                              {isMe && (
                                <button onClick={() => deleteItem(restaurantId, item.id)}
                                  className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-opacity px-1.5 py-0.5 hover:bg-red-50 rounded">
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 pb-2.5 text-xs text-gray-400 italic">
                        {isMe ? 'Aucun article — cliquez sur "+ Ajouter" pour commencer' : 'Pas encore de commande'}
                      </div>
                    )}
                  </div>
                )
              })}

            {/* Totals row */}
            {(() => {
              const allItems = weekOrders.flatMap(o =>
                o.items.filter(i => i.supplierId === activeSupplier)
              )
              if (allItems.length === 0) return null
              const totals: Record<string, { qty: number; unit: string }> = {}
              allItems.forEach(item => {
                const key = `${item.productName}__${item.unit}`
                totals[key] = { qty: (totals[key]?.qty || 0) + item.quantity, unit: item.unit }
              })
              return (
                <div className="border-t-2 border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <span className="font-bold text-sm text-gray-800">📦 TOTAUX</span>
                  </div>
                  <div className="pb-2">
                    {Object.entries(totals).map(([key, { qty, unit }]) => (
                      <div key={key} className="flex items-center justify-between px-4 py-1">
                        <span className="text-sm text-gray-700">{key.split('__')[0]}</span>
                        <span className="text-sm font-bold text-gray-900">{qty} <span className="text-gray-500 font-normal">{unit}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </>
      )}

      {/* Modal ajout */}
      {showAddModal && activeSupplier && (
        <AddItemModal
          supplierId={activeSupplier}
          restaurantId={restaurantId}
          onClose={() => setShowAddModal(false)}
          onAdd={(item) => addItem(restaurantId, item)}
        />
      )}
    </div>
  )
}
