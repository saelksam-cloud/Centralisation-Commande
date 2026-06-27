export type TradeCategory =
  | 'gros_oeuvre'
  | 'charpente'
  | 'couverture'
  | 'facade'
  | 'isolation'
  | 'electricite'
  | 'plomberie'
  | 'chauffage'
  | 'menuiserie_ext'
  | 'menuiserie_int'
  | 'platrerie'
  | 'carrelage'
  | 'peinture'
  | 'espaces_verts'
  | 'vrd'
  | 'autre'

export const TRADE_LABELS: Record<TradeCategory, string> = {
  gros_oeuvre: 'Gros Œuvre',
  charpente: 'Charpente',
  couverture: 'Couverture',
  facade: 'Façade',
  isolation: 'Isolation',
  electricite: 'Électricité',
  plomberie: 'Plomberie',
  chauffage: 'Chauffage / CVC',
  menuiserie_ext: 'Menuiserie Extérieure',
  menuiserie_int: 'Menuiserie Intérieure',
  platrerie: 'Plâtrerie / Cloisons',
  carrelage: 'Carrelage / Revêtements',
  peinture: 'Peinture / Finitions',
  espaces_verts: 'Espaces Verts',
  vrd: 'VRD / Terrassement',
  autre: 'Autre',
}

export const TRADE_COLORS: Record<TradeCategory, string> = {
  gros_oeuvre: '#1E40AF',
  charpente: '#92400E',
  couverture: '#374151',
  facade: '#6D28D9',
  isolation: '#059669',
  electricite: '#D97706',
  plomberie: '#0369A1',
  chauffage: '#DC2626',
  menuiserie_ext: '#7C3AED',
  menuiserie_int: '#9D174D',
  platrerie: '#6B7280',
  carrelage: '#B45309',
  peinture: '#BE185D',
  espaces_verts: '#16A34A',
  vrd: '#92400E',
  autre: '#4B5563',
}

export interface Subcontractor {
  id: string
  name: string
  category: TradeCategory
  phone?: string
  email?: string
  notes?: string
}

export interface PlanningLot {
  id: string
  name: string
  category: TradeCategory
  subcontractorId?: string
  startWeek: number  // week offset from project start (0-based)
  durationWeeks: number
  description?: string
  dependencies?: string[]  // lot ids
}

export interface Project {
  id: string
  name: string
  address?: string
  startDate: string  // ISO date
  lots: PlanningLot[]
  createdAt: string
  updatedAt: string
  devisFileName?: string
  devisContent?: string  // extracted text
}

export interface SubcontractorStore {
  subcontractors: Subcontractor[]
}
