'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useOrders } from '@/hooks/useOrders'
import { RESTAURANTS, CATALOG_PRODUCTS, UNITS, OrderItem, RestaurantId } from '@/lib/types'
import { getWeekYear, getNextDeadline, formatCountdown, generateId } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

const EMPTY_FORM: { productName: string; quantity: number; unit: string; supplier: 'rossi' | 'prodacteur'; category: string; notes: string } = { productName: '', quantity: 1, unit: 'bouteille', supplier: 'rossi', category: '', notes: '' }

export default function DashboardPage() {
  const { user, loaded: userLoaded } = useUser()
  const { orders, loaded: ordersLoaded, addItem, deleteItem, updateItem, validateOrder, getOrCreateOrder } = useOrders()
  const router = useRouter()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterSupplier, setFilterSupplier] = useState<'all' | 'rossi' | 'prodacteur'>('all')

  useEffect(() => {
    if (userLoaded && (!user || user === 'manager')) router.push('/')
  }, [userLoaded, user, router])

  if (!userLoaded || !ordersLoaded || !user || user === 'manager') return null

  const restaurantId = user as RestaurantId
  const restaurant = RESTAURANTS[restaurantId]
  const week = getWeekYear()
  const order = getOrCreateOrder(restaurantId, week)
  const items = order.items.filter(i => filterSupplier === 'all' || i.supplier === filterSupplier)

  const rossiDeadline = getNextDeadline(5) // Friday
  const prodDeadline = getNextDeadline(3)  // Wednesday

  const catalogBySupplier = CATALOG_PRODUCTS.filter(p => p.supplier === form.supplier)

  const handleSelectCatalog = (productName: string) => {
    const product = CATALOG_PRODUCTS.find(p => p.name === productName)
    if (product) {
      setForm(f => ({ ...f, productName: product.name, unit: product.unit, category: product.category, supplier: product.supplier as 'rossi' | 'prodacteur' }) as typeof f)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productName || form.quantity <= 0) return
    if (editingId) {
      updateItem(restaurantId, editingId, { ...form })
      setEditingId(null)
    } else {
      addItem(restaurantId, { ...form })
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const handleEdit = (item: OrderItem) => {
    setForm({ productName: item.productName, quantity: item.quantity, unit: item.unit, supplier: item.supplier, category: item.category, notes: item.notes || '' })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleValidate = () => {
    if (order.items.length === 0) return
    validateOrder(restaurantId)
  }

  const rossiItems = order.items.filter(i => i.supplier === 'rossi')
  const prodItems = order.items.filter(i => i.supplier === 'prodacteur')

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header card */}
      <div className="rounded-xl p-5 mb-6 text-white" style={{ backgroundColor: restaurant.color }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{restaurant.name}</h1>
            <p className="text-sm opacity-80">Semaine {week} — {order.items.length} article{order.items.length !== 1 ? 's' : ''}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs opacity-80">Rossi (vendredi)</div>
            <div className="font-bold text-lg">{formatCountdown(rossiDeadline)}</div>
            <div className="text-xs opacity-70">{rossiItems.length} article{rossiItems.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs opacity-80">Prodacteur (mercredi)</div>
            <div className="font-bold text-lg">{formatCountdown(prodDeadline)}</div>
            <div className="text-xs opacity-70">{prodItems.length} article{prodItems.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['all', 'rossi', 'prodacteur'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterSupplier(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterSupplier === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {s === 'all' ? 'Tous' : s === 'rossi' ? 'Rossi' : 'Prodacteur'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {order.status === 'draft' && order.items.length > 0 && (
            <button
              onClick={handleValidate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Valider la commande
            </button>
          )}
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM) }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: restaurant.color }}
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Modifier l\'article' : 'Nouvel article'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Fournisseur</label>
                <div className="flex gap-2">
                  {(['rossi', 'prodacteur'] as const).map(s => (
                    <button type="button" key={s}
                      onClick={() => setForm(f => ({ ...f, supplier: s, productName: '', category: '' }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.supplier === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {s === 'rossi' ? 'Rossi' : 'Prodacteur'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Produit du catalogue</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value=""
                  onChange={e => handleSelectCatalog(e.target.value)}
                >
                  <option value="">— Choisir dans le catalogue —</option>
                  {Object.entries(
                    catalogBySupplier.reduce((acc, p) => {
                      if (!acc[p.category]) acc[p.category] = []
                      acc[p.category].push(p)
                      return acc
                    }, {} as Record<string, typeof catalogBySupplier>)
                  ).map(([cat, products]) => (
                    <optgroup key={cat} label={cat}>
                      {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom du produit *</label>
                <input
                  required
                  type="text"
                  value={form.productName}
                  onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                  placeholder="ex: Perrier 75cl"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantité *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unité</label>
                <select
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optionnel)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Précisions, variante..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: restaurant.color }}>
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucun article</p>
          <p className="text-sm mt-1">Cliquez sur &quot;+ Ajouter&quot; pour commencer votre commande</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(['rossi', 'prodacteur'] as const).map(supplier => {
            const supplierItems = items.filter(i => i.supplier === supplier)
            if (filterSupplier !== 'all' && filterSupplier !== supplier) return null
            if (supplierItems.length === 0) return null
            return (
              <div key={supplier}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2 mt-4">
                  {supplier === 'rossi' ? 'Rossi — Boissons' : 'Prodacteur — Café, Sirops, Consommables'}
                </h3>
                {supplierItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-gray-300 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{item.productName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.quantity} {item.unit}
                        {item.notes && <span className="ml-2 text-gray-400">· {item.notes}</span>}
                      </div>
                    </div>
                    {order.status !== 'sent' && (
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button onClick={() => handleEdit(item)}
                          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
                          Modifier
                        </button>
                        <button onClick={() => deleteItem(restaurantId, item.id)}
                          className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
