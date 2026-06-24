'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Step } from '@/lib/types'
import { invalidate, useInvalidationKey } from '@/lib/hooks/invalidation'

// ─── Read hook ────────────────────────────────────────────────────────────────

export function useSteps(projectId: string) {
  const [data, setData] = useState<Step[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const invalidationKey = useInvalidationKey('steps')

  useEffect(() => {
    if (!projectId) return
    const supabase = createClient()
    let cancelled = false

    async function fetch() {
      setLoading(true)
      try {
        const { data: steps, error: stepsError } = await supabase
          .from('steps')
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true })

        if (stepsError) throw new Error(stepsError.message)
        if (!cancelled) setData(steps as Step[])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [projectId, invalidationKey])

  return { data, loading, error }
}

// ─── Mutation hook ────────────────────────────────────────────────────────────

export function useStepMutations() {
  const supabase = useMemo(() => createClient(), [])

  const createStep = useCallback(
    async (projectId: string, text: string): Promise<Step> => {
      const { data: existing, error: fetchError } = await supabase
        .from('steps')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1)

      if (fetchError) throw new Error(fetchError.message)

      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

      const { data: step, error } = await supabase
        .from('steps')
        .insert({ project_id: projectId, text, position: nextPosition })
        .select()
        .single()

      if (error) throw new Error(error.message)
      invalidate('steps')
      return step as Step
    },
    [supabase]
  )

  const updateStep = useCallback(
    async (id: string, data: Partial<Step>): Promise<Step> => {
      const { data: step, error } = await supabase
        .from('steps')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      invalidate('steps')
      return step as Step
    },
    [supabase]
  )

  const deleteStep = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from('steps').delete().eq('id', id)
      if (error) throw new Error(error.message)
      invalidate('steps')
    },
    [supabase]
  )

  const reorderSteps = useCallback(
    async (updates: Array<{ id: string; position: number }>): Promise<void> => {
      const results = await Promise.all(
        updates.map(({ id, position }) =>
          supabase.from('steps').update({ position }).eq('id', id)
        )
      )

      const firstError = results.find((r) => r.error)?.error
      if (firstError) throw new Error(firstError.message)
      invalidate('steps')
    },
    [supabase]
  )

  return { createStep, updateStep, deleteStep, reorderSteps }
}
