'use client'

import { useState } from 'react'
import { useProjectMutations } from '@/lib/hooks/useProjects'
import type { Project } from '@/lib/types'

interface DeleteConfirmModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteConfirmModal({
  project,
  isOpen,
  onClose,
  onDeleted,
}: DeleteConfirmModalProps) {
  const { deleteProject } = useProjectMutations()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !project) return null

  async function handleConfirm() {
    if (!project) return
    setLoading(true)
    setError(null)
    try {
      await deleteProject(project.id)
      onDeleted()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl p-6">
        <h2
          id="delete-modal-title"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          Delete project?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          <span className="font-medium text-gray-900">{project.title}</span> will
          be permanently deleted. This cannot be undone.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
