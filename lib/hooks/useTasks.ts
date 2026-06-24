'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus } from '@/lib/types'

// ─── Read hook ────────────────────────────────────────────────────────────────

export function useTasks(projectId: string) {
  const [data, setData] = useState<Task[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId) return
    const supabase = createClient()
    let cancelled = false

    async function fetch() {
      try {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })

        if (tasksError) throw new Error(tasksError.message)
        if (!cancelled) setData(tasks as Task[])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [projectId])

  return { data, loading, error }
}

// ─── Mutation hook ────────────────────────────────────────────────────────────

export function useTaskMutations() {
  const supabase = useMemo(() => createClient(), [])

  const createTask = useCallback(
    async (projectId: string, title: string): Promise<Task> => {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({ project_id: projectId, title })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return task as Task
    },
    [supabase]
  )

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus, projectId: string): Promise<Task> => {
      const now = new Date().toISOString()
      const updates: Partial<Task> & { updated_at: string } = {
        status,
        updated_at: now,
      }

      // Stamp started_at on first move to 'in_progress'
      if (status === 'in_progress') {
        const { data: existing, error: fetchError } = await supabase
          .from('tasks')
          .select('started_at')
          .eq('id', id)
          .single()

        if (fetchError) throw new Error(fetchError.message)
        if (!existing.started_at) {
          updates.started_at = now
        }
      }

      // Stamp completed_at on move to 'done'
      if (status === 'done') {
        updates.completed_at = now
      }

      // If moving to 'in_progress', ensure the parent project has started_at set
      if (status === 'in_progress') {
        const { data: project, error: projectFetchError } = await supabase
          .from('projects')
          .select('started_at')
          .eq('id', projectId)
          .single()

        if (projectFetchError) throw new Error(projectFetchError.message)

        if (!project.started_at) {
          const { error: projectUpdateError } = await supabase
            .from('projects')
            .update({
              started_at: now,
              updated_at: now,
            })
            .eq('id', projectId)

          if (projectUpdateError) throw new Error(projectUpdateError.message)
        }
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return task as Task
    },
    [supabase]
  )

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    [supabase]
  )

  return { createTask, updateTaskStatus, deleteTask }
}
