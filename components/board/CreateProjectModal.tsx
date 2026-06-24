'use client'

import { useState } from 'react'
import { useProjectMutations } from '@/lib/hooks/useProjects'
import type { ProjectCategory } from '@/lib/types'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'quick', label: '1–3 Hours' },
  { value: 'short', label: '1–3 Days' },
  { value: 'medium', label: '1–2 Weeks' },
]

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { createProject } = useProjectMutations()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('quick')
  const [description, setDescription] = useState('')
  const [inspiration, setInspiration] = useState('')
  const [expectedOutcomes, setExpectedOutcomes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  function resetForm() {
    setTitle('')
    setCategory('quick')
    setDescription('')
    setInspiration('')
    setExpectedOutcomes('')
    setError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await createProject({
        title: title.trim(),
        category,
        description: description.trim() || null,
        inspiration: inspiration.trim() || null,
        expected_outcomes: expectedOutcomes.trim() || null,
      })
      resetForm()
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2
            id="create-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            New project
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-y-auto"
        >
          <div className="px-6 py-4 space-y-5 flex-1">
            {/* Title */}
            <div>
              <label
                htmlFor="create-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="create-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Time estimate <span className="text-red-500">*</span>
              </span>
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border cursor-pointer transition-colors ${
                      category === cat.value
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={() => setCategory(cat.value)}
                      className="sr-only"
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="create-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="create-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Inspiration */}
            <div>
              <label
                htmlFor="create-inspiration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Inspiration
              </label>
              <textarea
                id="create-inspiration"
                value={inspiration}
                onChange={(e) => setInspiration(e.target.value)}
                placeholder="What inspired this project?"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Expected outcomes */}
            <div>
              <label
                htmlFor="create-outcomes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expected outcomes
              </label>
              <textarea
                id="create-outcomes"
                value={expectedOutcomes}
                onChange={(e) => setExpectedOutcomes(e.target.value)}
                placeholder="What do you want to achieve?"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
