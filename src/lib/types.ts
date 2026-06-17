export type RestaurantId = 'tadao' | 'malman' | 'terrasse' | 'itaca'
export type UserRole = RestaurantId | 'manager'

export interface OrderItem {
  id: string
  productName: string
  quantity: number
  unit: string
  supplier: 'rossi' | 'prodacteur'
  notes?: string
  category: string
}

export interface Order {
  id: string
  restaurantId: RestaurantId
  weekYear: string
  items: OrderItem[]
  status: 'draft' | 'validated' | 'sent'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  unit: string
  supplier: 'rossi' | 'prodacteur'
  category: string
}

export const RESTAURANTS: Record<RestaurantId, { name: string; color: string }> = {
  tadao: { name: 'Tadao', color: '#3B82F6' },
  malman: { name: 'Malman', color: '#10B981' },
  terrasse: { name: 'La Terrasse', color: '#F59E0B' },
  itaca: { name: 'Itaca', color: '#8B5CF6' },
}

export const UNITS = ['bouteille', 'carton', 'kg', 'litre', 'sachet', 'paquet', 'unité']

export const CATALOG_PRODUCTS: Product[] = [
  // Rossi
  { id: 'r1', name: 'Perrier 75cl', unit: 'bouteille', supplier: 'rossi', category: 'Eaux' },
  { id: 'r2', name: 'Perrier 33cl', unit: 'bouteille', supplier: 'rossi', category: 'Eaux' },
  { id: 'r3', name: 'Coca-Cola', unit: 'carton', supplier: 'rossi', category: 'Sodas' },
  { id: 'r4', name: 'Coca-Cola Zero', unit: 'carton', supplier: 'rossi', category: 'Sodas' },
  { id: 'r5', name: 'Chateldon 75cl', unit: 'bouteille', supplier: 'rossi', category: 'Eaux' },
  { id: 'r6', name: 'Chateldon 33cl', unit: 'bouteille', supplier: 'rossi', category: 'Eaux' },
  { id: 'r7', name: 'Tonic Fever Tree', unit: 'carton', supplier: 'rossi', category: 'Mixers' },
  { id: 'r8', name: 'San Pellegrino', unit: 'carton', supplier: 'rossi', category: 'Eaux' },
  { id: 'r9', name: 'Heineken 33cl', unit: 'carton', supplier: 'rossi', category: 'Bières' },
  // Prodacteur
  { id: 'p1', name: 'Café expresso', unit: 'kg', supplier: 'prodacteur', category: 'Café' },
  { id: 'p2', name: 'Sirop Menthe Maison Meneaux', unit: 'bouteille', supplier: 'prodacteur', category: 'Sirops' },
  { id: 'p3', name: 'Sirop Fraise Maison Meneaux', unit: 'bouteille', supplier: 'prodacteur', category: 'Sirops' },
  { id: 'p4', name: 'Sirop Citron Maison Meneaux', unit: 'bouteille', supplier: 'prodacteur', category: 'Sirops' },
  { id: 'p5', name: 'Sirop Caramel Maison Meneaux', unit: 'bouteille', supplier: 'prodacteur', category: 'Sirops' },
  { id: 'p6', name: 'Sucre de canne', unit: 'kg', supplier: 'prodacteur', category: 'Consommables' },
  { id: 'p7', name: 'Serviettes blanches', unit: 'paquet', supplier: 'prodacteur', category: 'Consommables' },
  { id: 'p8', name: 'Serviettes cocktail', unit: 'paquet', supplier: 'prodacteur', category: 'Consommables' },
  { id: 'p9', name: 'Lait entier', unit: 'litre', supplier: 'prodacteur', category: 'Produits frais' },
  { id: 'p10', name: 'Crème fraîche', unit: 'litre', supplier: 'prodacteur', category: 'Produits frais' },
]
