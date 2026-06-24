'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types'
import { invalidate, useInvalidationKey } from '@/lib/hooks/invalidation'

// ─── Read hooks ──────────────────────────────────────────────────────────────

export function useProjects() {
  const [data, setData] = useState<Project[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const invalidationKey = useInvalidationKey('projects')

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function fetch() {
      setLoading(true)
      try {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*, steps(*)')
          .order('created_at', { ascending: false })

        if (projectsError) throw new Error(projectsError.message)
        if (!cancelled) setData(projects as Project[])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [invalidationKey])

  return { data, loading, error }
}

export function useProject(id: string) {
  const [data, setData] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const invalidationKey = useInvalidationKey('projects')

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    let cancelled = false

    async function fetch() {
      setLoading(true)
      try {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*, steps(*)')
          .eq('id', id)
          .single()

        if (projectError) throw new Error(projectError.message)
        if (!cancelled) setData(project as Project)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [id, invalidationKey])

  return { data, loading, error }
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

type CreateProjectInput = Omit<
  Project,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'completed_at'
  | 'started_at'
  | 'status'
  | 'steps'
  | 'what_was_possible'
  | 'what_was_not_possible'
  | 'what_you_learned'
>

export function useProjectMutations() {
  const supabase = useMemo(() => createClient(), [])

  const createProject = useCallback(
    async (data: CreateProjectInput): Promise<Project> => {
      const { data: project, error } = await supabase
        .from('projects')
        .insert(data)
        .select()
        .single()

      if (error) throw new Error(error.message)
      invalidate('projects')
      return project as Project
    },
    [supabase]
  )

  const updateProject = useCallback(
    async (id: string, data: Partial<Project>): Promise<Project> => {
      const { data: project, error } = await supabase
        .from('projects')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      invalidate('projects')
      return project as Project
    },
    [supabase]
  )

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw new Error(error.message)
      invalidate('projects')
    },
    [supabase]
  )

  const markProjectDone = useCallback(
    async (
      id: string,
      retro: {
        what_was_possible: string
        what_was_not_possible: string
        what_you_learned: string
      }
    ): Promise<Project> => {
      const { data: project, error } = await supabase
        .from('projects')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...retro,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      invalidate('projects')
      return project as Project
    },
    [supabase]
  )

  const reopenProject = useCallback(
    async (id: string): Promise<Project> => {
      const { data: project, error } = await supabase
        .from('projects')
        .update({
          status: 'active',
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      invalidate('projects')
      return project as Project
    },
    [supabase]
  )

  const markProjectStarted = useCallback(
    async (id: string): Promise<void> => {
      const { data: existing, error: fetchError } = await supabase
        .from('projects')
        .select('started_at')
        .eq('id', id)
        .single()

      if (fetchError) throw new Error(fetchError.message)
      if (existing.started_at) return

      const { error } = await supabase
        .from('projects')
        .update({
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw new Error(error.message)
      invalidate('projects')
    },
    [supabase]
  )

  return {
    createProject,
    updateProject,
    deleteProject,
    markProjectDone,
    reopenProject,
    markProjectStarted,
  }
}
