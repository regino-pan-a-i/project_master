'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { useProjects, useProjectMutations } from '@/lib/hooks/useProjects'
import BoardColumn from '@/components/board/BoardColumn'
import ProjectCard from '@/components/board/ProjectCard'
import CreateProjectModal from '@/components/board/CreateProjectModal'
import EditProjectModal from '@/components/board/EditProjectModal'
import DeleteConfirmModal from '@/components/board/DeleteConfirmModal'
import type { Project, ProjectCategory } from '@/lib/types'

// Map droppable IDs to categories
const DROPPABLE_TO_CATEGORY: Record<string, ProjectCategory> = {
  quick: 'quick',
  short: 'short',
  medium: 'medium',
}

const COLUMN_TITLES: Record<string, string> = {
  quick: '1–3 Hours',
  short: '1–3 Days',
  medium: '1–2 Weeks',
  done: 'Done',
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-xs text-gray-400 text-center py-4 italic">{message}</p>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 pt-1">
      {label}
    </p>
  )
}

export default function BoardPage() {
  const { data: projects, loading, error } = useProjects()
  const { updateProject } = useProjectMutations()

  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  // Re-fetch by remounting — simple approach: track a refresh key
  const [, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return

    const newCategory = DROPPABLE_TO_CATEGORY[destination.droppableId]
    if (!newCategory) return // dropped on Done column (shouldn't happen, but guard)

    try {
      await updateProject(draggableId, { category: newCategory })
      refresh()
    } catch {
      // silently ignore; state will stay as-is until next fetch
    }
  }

  // Partition projects into columns
  const activeProjects = (projects ?? []).filter((p) => p.status === 'active')
  const doneProjects = (projects ?? []).filter((p) => p.status === 'done')

  function getColumnProjects(category: ProjectCategory) {
    return activeProjects.filter((p) => p.category === category)
  }

  function getStarted(category: ProjectCategory) {
    return getColumnProjects(category).filter((p) => p.started_at !== null)
  }

  function getBacklog(category: ProjectCategory) {
    return getColumnProjects(category).filter((p) => p.started_at === null)
  }

  // Build a flat ordered list for DnD indices (started first, then backlog)
  function getOrdered(category: ProjectCategory): Project[] {
    return [...getStarted(category), ...getBacklog(category)]
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              Project Master
            </h1>
            <nav className="flex items-center gap-4">
              <Link
                href="/board"
                className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-0.5"
              >
                Board
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New project
          </button>
        </div>
      </header>

      {/* Board body */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-sm text-gray-400 animate-pulse">
              Loading projects…
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-500">
              Failed to load projects: {error.message}
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 items-start">
              {/* Active columns */}
              {(['quick', 'short', 'medium'] as ProjectCategory[]).map(
                (category) => {
                  const started = getStarted(category)
                  const backlog = getBacklog(category)
                  const ordered = getOrdered(category)

                  return (
                    <BoardColumn
                      key={category}
                      title={COLUMN_TITLES[category]}
                      droppableId={category}
                    >
                      {ordered.length === 0 && (
                        <EmptyState message="No projects here yet" />
                      )}

                      {started.length > 0 && (
                        <>
                          <SectionLabel label="Started" />
                          {started.map((project) => {
                            const idx = ordered.findIndex(
                              (p) => p.id === project.id
                            )
                            return (
                              <ProjectCard
                                key={project.id}
                                project={project}
                                index={idx}
                                onEdit={setEditProject}
                                onDelete={setDeleteProject}
                              />
                            )
                          })}
                        </>
                      )}

                      {backlog.length > 0 && (
                        <>
                          <SectionLabel label="Backlog" />
                          {backlog.map((project) => {
                            const idx = ordered.findIndex(
                              (p) => p.id === project.id
                            )
                            return (
                              <ProjectCard
                                key={project.id}
                                project={project}
                                index={idx}
                                onEdit={setEditProject}
                                onDelete={setDeleteProject}
                              />
                            )
                          })}
                        </>
                      )}
                    </BoardColumn>
                  )
                }
              )}

              {/* Done column — no droppable */}
              <BoardColumn
                title={COLUMN_TITLES['done']}
                droppableId="done"
                isDoneColumn
              >
                {doneProjects.length === 0 && (
                  <EmptyState message="No completed projects yet" />
                )}
                {doneProjects.map((project, idx) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={idx}
                    isDoneColumn
                    onEdit={setEditProject}
                    onDelete={setDeleteProject}
                  />
                ))}
              </BoardColumn>
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Modals */}
      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
      />
      <EditProjectModal
        project={editProject}
        isOpen={editProject !== null}
        onClose={() => setEditProject(null)}
        onUpdated={refresh}
      />
      <DeleteConfirmModal
        project={deleteProject}
        isOpen={deleteProject !== null}
        onClose={() => setDeleteProject(null)}
        onDeleted={refresh}
      />
    </div>
  )
}
