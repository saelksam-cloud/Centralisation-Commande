'use client'
import { useState } from 'react'
import { Project, PlanningLot, Subcontractor } from '@/lib/planning-types'
import DevisUploader from './DevisUploader'

interface Props {
  subcontractors: Subcontractor[]
  onSave: (project: Project) => void
  onClose: () => void
}

export default function ProjectModal({ subcontractors, onSave, onClose }: Props) {
  const [step, setStep] = useState<'info' | 'devis' | 'generating' | 'done'>('info')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [devisText, setDevisText] = useState('')
  const [devisFileName, setDevisFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [generatedLots, setGeneratedLots] = useState<PlanningLot[]>([])
  const [totalWeeks, setTotalWeeks] = useState(0)
  const [summary, setSummary] = useState('')

  const handleDevisParsed = (text: string, fileName: string) => {
    setDevisText(text)
    setDevisFileName(fileName)
    setStep('devis')
  }

  const handleGenerate = async () => {
    if (!devisText) return
    setStep('generating')
    setError(null)
    try {
      const res = await fetch('/api/planning/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devisText, subcontractors, projectName: name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur génération')
      setGeneratedLots(data.lots || [])
      setTotalWeeks(data.totalWeeks || 0)
      setSummary(data.summary || '')
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setStep('devis')
    }
  }

  const handleSave = () => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      address,
      startDate,
      lots: generatedLots,
      devisFileName,
      devisContent: devisText.slice(0, 5000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSave(project)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Nouveau chantier</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Step: info */}
          {(step === 'info' || step === 'devis' || step === 'generating' || step === 'done') && (
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nom du chantier *</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Maison individuelle — Client Martin"
                  disabled={step !== 'info'}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Adresse</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="12 rue des Fleurs, 75001"
                    disabled={step !== 'info'}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date de début *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    disabled={step !== 'info'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: upload devis */}
          {step === 'info' && (
            <>
              <div className="mb-6">
                <div className="text-xs text-gray-500 mb-2">Devis (PDF ou texte)</div>
                <DevisUploader onParsed={handleDevisParsed} />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('devis')}
                  disabled={!name.trim()}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-40"
                >
                  Continuer sans devis →
                </button>
              </div>
            </>
          )}

          {step === 'devis' && (
            <div className="space-y-4">
              {devisFileName ? (
                <div className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3">
                  <span className="text-green-600">✓</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">{devisFileName}</p>
                    <p className="text-xs text-green-600">{devisText.length.toLocaleString()} caractères extraits</p>
                  </div>
                  <button
                    onClick={() => { setDevisText(''); setDevisFileName(''); setStep('info') }}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <DevisUploader onParsed={handleDevisParsed} />
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 justify-end">
                <button onClick={() => setStep('info')} className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">
                  Retour
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!devisText || !name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  Générer le planning IA
                </button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 text-center">
                Claude analyse votre devis et génère le planning...<br />
                <span className="text-xs text-gray-400">Cela prend 15-30 secondes</span>
              </p>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-4">
              {summary && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-900">{summary}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2 font-medium">{generatedLots.length} lots générés — {totalWeeks} semaines estimées</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {generatedLots.map(lot => (
                    <div key={lot.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{lot.name}</span>
                      <span className="text-gray-400">{lot.durationWeeks}s</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setStep('devis')} className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">
                  Régénérer
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enregistrer le planning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
