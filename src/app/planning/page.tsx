'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useProjects, useSubcontractors } from '@/hooks/usePlanning'
import { Project, TRADE_LABELS } from '@/lib/planning-types'
import GanttChart from '@/components/planning/GanttChart'
import SubcontractorManager from '@/components/planning/SubcontractorManager'
import ProjectModal from '@/components/planning/ProjectModal'

type View = 'projects' | 'subcontractors'

export default function PlanningPage() {
  const { projects, loaded: projectsLoaded, saveProject, deleteProject } = useProjects()
  const { subcontractors, loaded: subsLoaded, addSubcontractor, updateSubcontractor, deleteSubcontractor } = useSubcontractors()
  const [view, setView] = useState<View>('projects')
  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (!projectsLoaded || !subsLoaded) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  const handleSaveProject = (project: Project) => {
    saveProject(project)
    setSelectedProject(project)
    setView('projects')
  }

  if (selectedProject) {
    const project = projects.find(p => p.id === selectedProject.id) || selectedProject
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-700 text-sm">
            ← Retour
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            {project.address && <p className="text-sm text-gray-400">{project.address}</p>}
          </div>
          <div className="ml-auto flex gap-2">
            <span className="text-sm text-gray-400">
              Début: {new Date(project.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => { deleteProject(project.id); setSelectedProject(null) }}
              className="text-sm text-red-400 hover:text-red-600 px-2 py-1"
            >
              Supprimer
            </button>
          </div>
        </div>

        {project.lots.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400">Aucun lot dans ce planning.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Planning Gantt</h2>
              <span className="text-sm text-gray-400">{project.lots.length} lots</span>
            </div>
            <GanttChart
              lots={project.lots}
              totalWeeks={Math.max(...project.lots.map(l => l.startWeek + l.durationWeeks), 4)}
              startDate={project.startDate}
              subcontractors={subcontractors}
            />
          </div>
        )}

        {/* Lots detail */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Détail des lots</h2>
          <div className="space-y-3">
            {project.lots.map(lot => {
              const sub = subcontractors.find(s => s.id === lot.subcontractorId)
              return (
                <div key={lot.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{lot.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {TRADE_LABELS[lot.category]}
                      </span>
                    </div>
                    {lot.description && <p className="text-xs text-gray-500 mt-1">{lot.description}</p>}
                    {sub && <p className="text-xs text-blue-600 mt-1">→ {sub.name}{sub.phone ? ` — ${sub.phone}` : ''}</p>}
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <div>Sem. {lot.startWeek + 1}</div>
                    <div>{lot.durationWeeks} sem.</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning Chantier</h1>
          <p className="text-sm text-gray-400 mt-1">
            <Link href="/commandes" className="hover:text-gray-600">Commandes</Link>
            {' · '}Planning
          </p>
        </div>
        {view === 'projects' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            + Nouveau chantier
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setView('projects')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'projects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Chantiers ({projects.length})
        </button>
        <button
          onClick={() => setView('subcontractors')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'subcontractors' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Sous-traitants ({subcontractors.length})
        </button>
      </div>

      {/* Content */}
      {view === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun chantier</h3>
              <p className="text-sm text-gray-400 mb-6">
                Créez votre premier chantier en téléchargeant un devis.<br />
                Claude analysera les travaux et générera le planning automatiquement.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Créer un chantier
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map(project => {
                const totalWeeks = project.lots.length > 0
                  ? Math.max(...project.lots.map(l => l.startWeek + l.durationWeeks))
                  : 0
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        {project.address && <p className="text-sm text-gray-400">{project.address}</p>}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(project.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-gray-400">
                      <span>{project.lots.length} lots</span>
                      {totalWeeks > 0 && <span>~{totalWeeks} semaines</span>}
                      {project.devisFileName && <span>📄 {project.devisFileName}</span>}
                    </div>
                    {/* Mini Gantt preview */}
                    {project.lots.length > 0 && totalWeeks > 0 && (
                      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        {project.lots.slice(0, 8).map(lot => (
                          <div
                            key={lot.id}
                            className="absolute h-2"
                            style={{
                              left: `${(lot.startWeek / totalWeeks) * 100}%`,
                              width: `${(lot.durationWeeks / totalWeeks) * 100}%`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {view === 'subcontractors' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <SubcontractorManager
            subcontractors={subcontractors}
            onAdd={addSubcontractor}
            onDelete={deleteSubcontractor}
            onUpdate={updateSubcontractor}
          />
        </div>
      )}

      {showModal && (
        <ProjectModal
          subcontractors={subcontractors}
          onSave={handleSaveProject}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
