'use client'
import { useState, useEffect, useCallback } from 'react'
import { Project, Subcontractor } from '@/lib/planning-types'

const PROJECTS_KEY = 'planning_projects'
const SUBS_KEY = 'planning_subcontractors'

export function useSubcontractors() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUBS_KEY)
      setSubcontractors(raw ? JSON.parse(raw) : [])
    } catch {
      setSubcontractors([])
    }
    setLoaded(true)
  }, [])

  const save = useCallback((list: Subcontractor[]) => {
    setSubcontractors(list)
    localStorage.setItem(SUBS_KEY, JSON.stringify(list))
  }, [])

  const addSubcontractor = useCallback((sub: Omit<Subcontractor, 'id'>) => {
    const newSub: Subcontractor = { ...sub, id: crypto.randomUUID() }
    setSubcontractors(prev => {
      const next = [...prev, newSub]
      localStorage.setItem(SUBS_KEY, JSON.stringify(next))
      return next
    })
    return newSub
  }, [])

  const updateSubcontractor = useCallback((updated: Subcontractor) => {
    setSubcontractors(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s)
      localStorage.setItem(SUBS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const deleteSubcontractor = useCallback((id: string) => {
    setSubcontractors(prev => {
      const next = prev.filter(s => s.id !== id)
      localStorage.setItem(SUBS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { subcontractors, loaded, addSubcontractor, updateSubcontractor, deleteSubcontractor, save }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROJECTS_KEY)
      setProjects(raw ? JSON.parse(raw) : [])
    } catch {
      setProjects([])
    }
    setLoaded(true)
  }, [])

  const saveProject = useCallback((project: Project) => {
    setProjects(prev => {
      const exists = prev.find(p => p.id === project.id)
      const next = exists
        ? prev.map(p => p.id === project.id ? project : p)
        : [...prev, project]
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id)
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { projects, loaded, saveProject, deleteProject }
}
