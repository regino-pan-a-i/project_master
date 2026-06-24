'use client'

import { useState } from 'react'
import { useProjectMutations } from '@/lib/hooks/useProjects'

interface RetroFormProps {
  projectId: string
  onSubmit: () => void
  onCancel: () => void
}

export default function RetroForm({ projectId, onSubmit, onCancel }: RetroFormProps) {
  const { markProjectDone } = useProjectMutations()
  const [whatWasPossible, setWhatWasPossible] = useState('')
  const [whatWasNotPossible, setWhatWasNotPossible] = useState('')
  const [whatYouLearned, setWhatYouLearned] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await markProjectDone(projectId, {
        what_was_possible: whatWasPossible,
        what_was_not_possible: whatWasNotPossible,
        what_you_learned: whatYouLearned,
      })
      onSubmit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Mark Project as Done</h2>
        <p className="text-sm text-gray-500 mb-6">Fill in a quick retrospective before closing this project.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What was possible
            </label>
            <textarea
              value={whatWasPossible}
              onChange={(e) => setWhatWasPossible(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What went well? What did you accomplish?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What was not possible
            </label>
            <textarea
              value={whatWasNotPossible}
              onChange={(e) => setWhatWasNotPossible(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What didn't work out? What were the blockers?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What you learned
            </label>
            <textarea
              value={whatYouLearned}
              onChange={(e) => setWhatYouLearned(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Key takeaways, lessons, things to carry forward."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : 'Mark as Done'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
