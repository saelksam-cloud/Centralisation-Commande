'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { CATALOG_PRODUCTS } from '@/lib/types'

export default function CatalogPage() {
  const { user, loaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loaded && !user) router.push('/')
  }, [loaded, user, router])

  if (!loaded || !user) return null

  const bySupplier = {
    rossi: CATALOG_PRODUCTS.filter(p => p.supplier === 'rossi'),
    prodacteur: CATALOG_PRODUCTS.filter(p => p.supplier === 'prodacteur'),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue produits</h1>
        <p className="text-gray-500 text-sm mt-1">Produits disponibles par fournisseur</p>
      </div>

      {(['rossi', 'prodacteur'] as const).map(supplier => {
        const products = bySupplier[supplier]
        const byCategory = products.reduce((acc, p) => {
          if (!acc[p.category]) acc[p.category] = []
          acc[p.category].push(p)
          return acc
        }, {} as Record<string, typeof products>)

        return (
          <div key={supplier} className="mb-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 ${supplier === 'rossi' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {supplier === 'rossi' ? 'Rossi — Boissons' : 'Prodacteur — Café, Sirops, Consommables'}
              <span className="text-xs opacity-70">({products.length} produits)</span>
            </div>

            <div className="space-y-4">
              {Object.entries(byCategory).map(([cat, catProducts]) => (
                <div key={cat}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{cat}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">{product.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{product.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Calendrier des commandes :</strong>
        <ul className="mt-2 space-y-1 text-amber-700">
          <li>• <strong>Rossi</strong> — commande envoyée le vendredi avant 12h</li>
          <li>• <strong>Prodacteur</strong> — commande envoyée le mercredi avant 12h</li>
          <li>• Sirops <strong>Maison Meneaux</strong> commandés via Prodacteur</li>
        </ul>
      </div>
    </div>
  )
}
