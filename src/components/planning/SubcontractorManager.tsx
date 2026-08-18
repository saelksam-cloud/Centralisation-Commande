'use client'
import { useState } from 'react'
import { Subcontractor, TradeCategory, TRADE_LABELS } from '@/lib/planning-types'

interface Props {
  subcontractors: Subcontractor[]
  onAdd: (sub: Omit<Subcontractor, 'id'>) => void
  onDelete: (id: string) => void
  onUpdate: (sub: Subcontractor) => void
}

const EMPTY_FORM = { name: '', category: 'gros_oeuvre' as TradeCategory, phone: '', email: '', notes: '' }

export default function SubcontractorManager({ subcontractors, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Subcontractor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const grouped = subcontractors.reduce<Record<string, Subcontractor[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing) {
      onUpdate({ ...editing, ...form })
      setEditing(null)
    } else {
      onAdd(form)
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const startEdit = (sub: Subcontractor) => {
    setEditing(sub)
    setForm({ name: sub.name, category: sub.category, phone: sub.phone || '', email: sub.email || '', notes: sub.notes || '' })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Sous-traitants</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_FORM) }}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nom *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Entreprise Dupont"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Corps de métier *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as TradeCategory }))}
              >
                {(Object.entries(TRADE_LABELS) as [TradeCategory, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="06 00 00 00 00"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="contact@entreprise.fr"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Spécialités, disponibilités..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              {editing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {subcontractors.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Aucun sous-traitant. Ajoutez-en pour qu'ils soient assignés automatiquement lors de la génération du planning.
        </p>
      ) : (
        <div className="space-y-4">
          {(Object.entries(grouped) as [TradeCategory, Subcontractor[]][]).map(([cat, subs]) => (
            <div key={cat}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {TRADE_LABELS[cat]}
              </div>
              <div className="space-y-2">
                {subs.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{sub.name}</div>
                      <div className="text-xs text-gray-400">
                        {[sub.phone, sub.email].filter(Boolean).join(' · ') || 'Pas de contact renseigné'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(sub)} className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1">
                        Modifier
                      </button>
                      <button onClick={() => onDelete(sub.id)} className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
