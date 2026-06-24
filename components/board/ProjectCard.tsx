'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Draggable } from '@hello-pangea/dnd'
import { useProjectMutations } from '@/lib/hooks/useProjects'
import type { Project, ProjectCategory } from '@/lib/types'

interface ProjectCardProps {
  project: Project
  index: number
  isDoneColumn?: boolean
  onEdit: (p: Project) => void
  onDelete: (p: Project) => void
}

const CATEGORY_BADGE: Record<ProjectCategory, string> = {
  quick: 'bg-green-100 text-green-700',
  short: 'bg-blue-100 text-blue-700',
  medium: 'bg-purple-100 text-purple-700',
}

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  quick: '1–3 hrs',
  short: '1–3 days',
  medium: '1–2 wks',
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function CardContent({
  project,
  isDoneColumn,
  onEdit,
  onDelete,
}: Omit<ProjectCardProps, 'index'>) {
  const router = useRouter()
  const { markProjectStarted } = useProjectMutations()
  const [markingStarted, setMarkingStarted] = useState(false)

  const completedSteps = (project.steps ?? []).filter((s) => s.completed).length
  const totalSteps = (project.steps ?? []).length

  async function handleMarkStarted(e: React.MouseEvent) {
    e.stopPropagation()
    setMarkingStarted(true)
    try {
      await markProjectStarted(project.id)
    } finally {
      setMarkingStarted(false)
    }
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    onEdit(project)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(project)
  }

  return (
    <div
      onClick={() => router.push(`/board/${project.id}`)}
      className={`rounded-lg border p-4 cursor-pointer transition-all duration-150 select-none ${
        isDoneColumn
          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm leading-tight truncate ${
              isDoneColumn ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}
          >
            {project.title}
          </h3>
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEdit}
            title="Edit"
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Category + pills row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[project.category]}`}
        >
          {CATEGORY_LABEL[project.category]}
        </span>

        {project.started_at && !isDoneColumn && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Started
          </span>
        )}

        {totalSteps > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {completedSteps}/{totalSteps} steps
          </span>
        )}
      </div>

      {/* Description snippet */}
      {project.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {project.description}
        </p>
      )}

      {/* Done column: completion date */}
      {isDoneColumn && project.completed_at && (
        <p className="text-xs text-gray-400 mt-1">
          Completed {formatDate(project.completed_at)}
        </p>
      )}

      {/* Mark Started button */}
      {!isDoneColumn && !project.started_at && (
        <button
          onClick={handleMarkStarted}
          disabled={markingStarted}
          className="mt-2 w-full text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md px-2 py-1 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
        >
          {markingStarted ? 'Marking…' : 'Mark as started'}
        </button>
      )}
    </div>
  )
}

export default function ProjectCard({
  project,
  index,
  isDoneColumn = false,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  if (isDoneColumn) {
    return (
      <div className="group">
        <CardContent
          project={project}
          isDoneColumn={isDoneColumn}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    )
  }

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group transition-transform ${snapshot.isDragging ? 'rotate-1 scale-105' : ''}`}
        >
          <CardContent
            project={project}
            isDoneColumn={isDoneColumn}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </Draggable>
  )
}
