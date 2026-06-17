export type SupplierId = 'rossi' | 'prodacteur' | 'gaetan' | 'benedetti' | 'tarantino'
export type OrderStatus = 'draft' | 'validated' | 'sent'
export type RestaurantId = 'tadao' | 'malman' | 'terrasse' | 'itaca'
export type UserRole = RestaurantId | 'manager'

export interface Supplier {
  name: string
  description: string
  color: string
  sendDayOfWeek: number // 0=Sunday,1=Monday,...,6=Saturday
  sendHour: number
  deliveryDaysAfter: number
  whatsappNumber: string
  restaurants: RestaurantId[]
}

export const SUPPLIERS: Record<SupplierId, Supplier> = {
  rossi: {
    name: 'Rossi',
    description: 'Boissons — Eaux, Sodas, Bières, Mixers',
    color: '#3B82F6',
    sendDayOfWeek: 5,
    sendHour: 12,
    deliveryDaysAfter: 2,
    whatsappNumber: '33600000001',
    restaurants: ['tadao', 'malman', 'terrasse', 'itaca'],
  },
  prodacteur: {
    name: 'Prodacteur',
    description: 'Café, Sirops Maison Meneaux, Sucre',
    color: '#10B981',
    sendDayOfWeek: 3,
    sendHour: 12,
    deliveryDaysAfter: 2,
    whatsappNumber: '33600000002',
    restaurants: ['tadao', 'malman', 'terrasse', 'itaca'],
  },
  gaetan: {
    name: 'Gaëtan',
    description: 'Consommables — Serviettes, Pailles, Emballages',
    color: '#F59E0B',
    sendDayOfWeek: 1,
    sendHour: 10,
    deliveryDaysAfter: 3,
    whatsappNumber: '33600000003',
    restaurants: ['tadao', 'malman', 'terrasse', 'itaca'],
  },
  benedetti: {
    name: 'Benedetti',
    description: 'Jus de fruits frais',
    color: '#8B5CF6',
    sendDayOfWeek: 4,
    sendHour: 12,
    deliveryDaysAfter: 1,
    whatsappNumber: '33600000004',
    restaurants: ['tadao', 'malman', 'terrasse', 'itaca'],
  },
  tarantino: {
    name: 'Tarantino',
    description: 'Glaces artisanales (La Terrasse uniquement)',
    color: '#EC4899',
    sendDayOfWeek: 2,
    sendHour: 10,
    deliveryDaysAfter: 2,
    whatsappNumber: '33600000005',
    restaurants: ['terrasse'],
  },
}

export interface Restaurant {
  name: string
  color: string
}

export const RESTAURANTS: Record<RestaurantId, Restaurant> = {
  tadao: { name: 'Tadao', color: '#3B82F6' },
  malman: { name: 'Malman', color: '#10B981' },
  terrasse: { name: 'La Terrasse', color: '#F59E0B' },
  itaca: { name: 'Itaca', color: '#8B5CF6' },
}

export interface Product {
  id: string
  name: string
  unit: string
  supplierId: SupplierId
  category: string
}

export const CATALOG_PRODUCTS: Product[] = [
  // Rossi
  { id: 'rossi-1', name: 'Perrier 75cl', unit: 'bouteille', supplierId: 'rossi', category: 'Eaux' },
  { id: 'rossi-2', name: 'Perrier 33cl', unit: 'bouteille', supplierId: 'rossi', category: 'Eaux' },
  { id: 'rossi-3', name: 'Coca-Cola', unit: 'carton 24', supplierId: 'rossi', category: 'Sodas' },
  { id: 'rossi-4', name: 'Coca-Cola Zero', unit: 'carton 24', supplierId: 'rossi', category: 'Sodas' },
  { id: 'rossi-5', name: 'Chateldon 75cl', unit: 'bouteille', supplierId: 'rossi', category: 'Eaux' },
  { id: 'rossi-6', name: 'Chateldon 33cl', unit: 'bouteille', supplierId: 'rossi', category: 'Eaux' },
  { id: 'rossi-7', name: 'Tonic Fever Tree', unit: 'carton 24', supplierId: 'rossi', category: 'Mixers' },
  { id: 'rossi-8', name: 'San Pellegrino', unit: 'carton', supplierId: 'rossi', category: 'Eaux' },
  { id: 'rossi-9', name: 'Heineken 33cl', unit: 'carton 24', supplierId: 'rossi', category: 'Bières' },
  { id: 'rossi-10', name: 'Leffe Blonde', unit: 'carton 24', supplierId: 'rossi', category: 'Bières' },
  // Prodacteur
  { id: 'prod-1', name: 'Café expresso', unit: 'kg', supplierId: 'prodacteur', category: 'Café' },
  { id: 'prod-2', name: 'Sirop Menthe Maison Meneaux', unit: 'bouteille', supplierId: 'prodacteur', category: 'Sirops' },
  { id: 'prod-3', name: 'Sirop Fraise Maison Meneaux', unit: 'bouteille', supplierId: 'prodacteur', category: 'Sirops' },
  { id: 'prod-4', name: 'Sirop Citron Maison Meneaux', unit: 'bouteille', supplierId: 'prodacteur', category: 'Sirops' },
  { id: 'prod-5', name: 'Sirop Caramel Maison Meneaux', unit: 'bouteille', supplierId: 'prodacteur', category: 'Sirops' },
  { id: 'prod-6', name: 'Sirop Violette Maison Meneaux', unit: 'bouteille', supplierId: 'prodacteur', category: 'Sirops' },
  { id: 'prod-7', name: 'Sucre de canne', unit: 'kg', supplierId: 'prodacteur', category: 'Épicerie' },
  { id: 'prod-8', name: 'Lait entier', unit: 'litre', supplierId: 'prodacteur', category: 'Épicerie' },
  { id: 'prod-9', name: 'Crème fraîche', unit: 'litre', supplierId: 'prodacteur', category: 'Épicerie' },
  // Gaëtan
  { id: 'gaetan-1', name: 'Serviettes blanches cocktail', unit: 'paquet 500', supplierId: 'gaetan', category: 'Serviettes' },
  { id: 'gaetan-2', name: 'Serviettes blanches grandes', unit: 'paquet 500', supplierId: 'gaetan', category: 'Serviettes' },
  { id: 'gaetan-3', name: 'Pailles droites', unit: 'boîte 250', supplierId: 'gaetan', category: 'Pailles' },
  { id: 'gaetan-4', name: 'Pailles courbées', unit: 'boîte 250', supplierId: 'gaetan', category: 'Pailles' },
  { id: 'gaetan-5', name: 'Pailles en papier', unit: 'boîte 100', supplierId: 'gaetan', category: 'Pailles' },
  { id: 'gaetan-6', name: 'Cure-dents', unit: 'boîte', supplierId: 'gaetan', category: 'Divers' },
  { id: 'gaetan-7', name: 'Pics à cocktail', unit: 'boîte', supplierId: 'gaetan', category: 'Divers' },
  // Benedetti
  { id: 'bene-1', name: 'Jus Orange', unit: 'litre', supplierId: 'benedetti', category: 'Jus' },
  { id: 'bene-2', name: 'Jus Pomme', unit: 'litre', supplierId: 'benedetti', category: 'Jus' },
  { id: 'bene-3', name: 'Jus Pamplemousse', unit: 'litre', supplierId: 'benedetti', category: 'Jus' },
  { id: 'bene-4', name: 'Jus Ananas', unit: 'litre', supplierId: 'benedetti', category: 'Jus' },
  { id: 'bene-5', name: 'Jus Mangue', unit: 'litre', supplierId: 'benedetti', category: 'Jus' },
  { id: 'bene-6', name: 'Citrons', unit: 'kg', supplierId: 'benedetti', category: 'Fruits' },
  { id: 'bene-7', name: 'Limes', unit: 'kg', supplierId: 'benedetti', category: 'Fruits' },
  { id: 'bene-8', name: 'Oranges', unit: 'kg', supplierId: 'benedetti', category: 'Fruits' },
  // Tarantino
  { id: 'tara-1', name: 'Glace Vanille', unit: 'bac 5L', supplierId: 'tarantino', category: 'Glaces' },
  { id: 'tara-2', name: 'Glace Chocolat', unit: 'bac 5L', supplierId: 'tarantino', category: 'Glaces' },
  { id: 'tara-3', name: 'Sorbet Citron', unit: 'bac 5L', supplierId: 'tarantino', category: 'Sorbets' },
  { id: 'tara-4', name: 'Sorbet Fraise', unit: 'bac 5L', supplierId: 'tarantino', category: 'Sorbets' },
  { id: 'tara-5', name: 'Glace Pistache', unit: 'bac 5L', supplierId: 'tarantino', category: 'Glaces' },
  { id: 'tara-6', name: 'Cornet gaufrette', unit: 'sachet 50', supplierId: 'tarantino', category: 'Accessoires' },
]

export const UNITS = ['bouteille', 'carton', 'carton 24', 'kg', 'litre', 'sachet', 'paquet', 'boîte', 'unité', 'bac 5L']

export interface OrderItem {
  id: string
  productName: string
  quantity: number
  unit: string
  supplierId: SupplierId
  category: string
  notes?: string
}

export interface WeekOrder {
  id: string
  restaurantId: RestaurantId
  weekYear: string  // "2026-W25"
  items: OrderItem[]
  statusBySupplier: Partial<Record<SupplierId, OrderStatus>>
  createdAt: string
  updatedAt: string
}
