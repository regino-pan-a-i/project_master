'use client'

import { useState } from 'react'
import { useSteps, useStepMutations } from '@/lib/hooks/useSteps'

interface StepsChecklistProps {
  projectId: string
}

export default function StepsChecklist({ projectId }: StepsChecklistProps) {
  const { data: steps, loading } = useSteps(projectId)
  const { createStep, updateStep, deleteStep } = useStepMutations()
  const [newStepText, setNewStepText] = useState('')
  const [adding, setAdding] = useState(false)
  const [localSteps, setLocalSteps] = useState<typeof steps>(null)

  // Use local steps for optimistic updates, fall back to fetched
  const displaySteps = localSteps ?? steps ?? []

  const completedCount = displaySteps.filter((s) => s.completed).length
  const totalCount = displaySteps.length

  async function handleToggle(id: string, current: boolean) {
    // Optimistic update
    const updated = displaySteps.map((s) =>
      s.id === id ? { ...s, completed: !current } : s
    )
    setLocalSteps(updated)
    try {
      await updateStep(id, { completed: !current })
    } catch {
      // Revert on error
      setLocalSteps(displaySteps)
    }
  }

  async function handleDelete(id: string) {
    const updated = displaySteps.filter((s) => s.id !== id)
    setLocalSteps(updated)
    try {
      await deleteStep(id)
    } catch {
      setLocalSteps(displaySteps)
    }
  }

  async function handleAdd() {
    const text = newStepText.trim()
    if (!text) return
    setAdding(true)
    try {
      const step = await createStep(projectId, text)
      setLocalSteps([...(localSteps ?? steps ?? []), step])
      setNewStepText('')
    } finally {
      setAdding(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  if (loading && !steps) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Steps — {completedCount} of {totalCount} complete
      </h3>

      {displaySteps.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">No steps yet. Add one below.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {displaySteps.map((step) => (
            <li key={step.id} className="flex items-start gap-3 group">
              <input
                type="checkbox"
                checked={step.completed}
                onChange={() => handleToggle(step.id, step.completed)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              />
              <span
                className={`flex-1 text-sm ${
                  step.completed ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {step.text}
              </span>
              <button
                onClick={() => handleDelete(step.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs px-1 transition-opacity flex-shrink-0"
                aria-label="Delete step"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newStepText}
          onChange={(e) => setNewStepText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a step..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newStepText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {adding ? '...' : 'Add'}
        </button>
      </div>
    </div>
  )
}
