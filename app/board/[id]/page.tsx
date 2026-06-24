'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProject, useProjectMutations } from '@/lib/hooks/useProjects'
import StepsChecklist from '@/components/detail/StepsChecklist'
import RetroForm from '@/components/detail/RetroForm'
import type { ProjectCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  quick: 'Quick',
  short: 'Short',
  medium: 'Medium',
}

const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  quick: 'bg-green-100 text-green-700',
  short: 'bg-yellow-100 text-yellow-700',
  medium: 'bg-purple-100 text-purple-700',
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-16" />
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

interface EditableSectionProps {
  label: string
  value: string | null
  onSave: (value: string) => Promise<unknown>
}

function EditableSection({ label, value, onSave }: EditableSectionProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDraft(value ?? '')
    setEditing(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {value ?? <span className="text-gray-400 italic">Not set</span>}
        </p>
      )}
    </div>
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: project, loading, error } = useProject(id)
  const { updateProject, markProjectStarted, reopenProject } = useProjectMutations()

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [showRetroForm, setShowRetroForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (loading) return <LoadingSkeleton />
  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/board" className="text-sm text-blue-600 hover:underline">← Back to Board</Link>
        <p className="mt-6 text-red-600">{error?.message ?? 'Project not found.'}</p>
      </div>
    )
  }

  async function handleTitleSave() {
    if (!titleDraft.trim()) return
    try {
      await updateProject(id, { title: titleDraft.trim() })
    } finally {
      setEditingTitle(false)
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleTitleSave()
    if (e.key === 'Escape') setEditingTitle(false)
  }

  async function handleMarkStarted() {
    setActionError(null)
    try {
      await markProjectStarted(id)
      router.refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error')
    }
  }

  async function handleReopen() {
    setActionError(null)
    try {
      await reopenProject(id)
      router.push('/board')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/board" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Board
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          {editingTitle ? (
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleSave}
              autoFocus
              className="flex-1 text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
            />
          ) : (
            <h1
              className="flex-1 text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-700 transition-colors"
              onClick={() => {
                setTitleDraft(project.title)
                setEditingTitle(true)
              }}
              title="Click to edit title"
            >
              {project.title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[project.category]}`}>
            {CATEGORY_LABELS[project.category]}
          </span>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
              project.status === 'done'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {project.status === 'done' ? 'Done' : 'Active'}
          </span>
          <Link
            href={`/board/${id}/tasks`}
            className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 px-3 py-1 rounded-lg transition-colors"
          >
            Open Board →
          </Link>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8 mb-8">
        <EditableSection
          label="Description"
          value={project.description}
          onSave={(val) => updateProject(id, { description: val })}
        />
        <EditableSection
          label="Inspiration"
          value={project.inspiration}
          onSave={(val) => updateProject(id, { inspiration: val })}
        />
        <EditableSection
          label="Expected Outcomes"
          value={project.expected_outcomes}
          onSave={(val) => updateProject(id, { expected_outcomes: val })}
        />

        {/* Steps */}
        <div>
          <StepsChecklist projectId={id} />
        </div>

        {/* Retrospective display */}
        {project.status === 'done' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Retrospective</h3>
              <button
                onClick={() => setShowRetroForm(true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Edit retrospective
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">What was possible</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {project.what_was_possible ?? <span className="text-gray-400 italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">What was not possible</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {project.what_was_not_possible ?? <span className="text-gray-400 italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">What you learned</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {project.what_you_learned ?? <span className="text-gray-400 italic">Not set</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {actionError && (
        <p className="text-sm text-red-600 mb-3">{actionError}</p>
      )}

      <div className="flex gap-3 flex-wrap border-t border-gray-100 pt-6">
        {project.status === 'active' && !project.started_at && (
          <button
            onClick={handleMarkStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Mark Started
          </button>
        )}
        {project.status === 'active' && (
          <button
            onClick={() => setShowRetroForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Mark as Done
          </button>
        )}
        {project.status === 'done' && (
          <button
            onClick={handleReopen}
            className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Reopen Project
          </button>
        )}
      </div>

      {/* Retro modal */}
      {showRetroForm && (
        <RetroForm
          projectId={id}
          onSubmit={() => {
            setShowRetroForm(false)
            router.refresh()
          }}
          onCancel={() => setShowRetroForm(false)}
        />
      )}
    </div>
  )
}
