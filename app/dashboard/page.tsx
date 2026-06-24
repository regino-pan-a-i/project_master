'use client'

import Link from 'next/link'
import { useProjects } from '@/lib/hooks/useProjects'
import { useTasks } from '@/lib/hooks/useTasks'
import type { Project, Task } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avgMs(tasks: Task[]): number | null {
  const doneTasks = tasks.filter(
    (t) => t.status === 'done' && t.started_at !== null && t.completed_at !== null
  )
  if (doneTasks.length === 0) return null
  const total = doneTasks.reduce((sum, t) => {
    return sum + (new Date(t.completed_at!).getTime() - new Date(t.started_at!).getTime())
  }, 0)
  return total / doneTasks.length
}

function avgLeadMs(tasks: Task[]): number | null {
  const doneTasks = tasks.filter(
    (t) => t.status === 'done' && t.completed_at !== null
  )
  if (doneTasks.length === 0) return null
  const total = doneTasks.reduce((sum, t) => {
    return sum + (new Date(t.completed_at!).getTime() - new Date(t.created_at).getTime())
  }, 0)
  return total / doneTasks.length
}

function formatDuration(ms: number): string {
  const hours = ms / (1000 * 60 * 60)
  if (hours < 24) return `${Math.round(hours)} hrs`
  const days = hours / 24
  return `${Math.round(days)} days`
}

// ─── DashboardProjectCard ─────────────────────────────────────────────────────

function DashboardProjectCard({ project }: { project: Project }) {
  const { data: tasks, loading } = useTasks(project.id)

  const totalCount = tasks?.length ?? 0
  const completedCount = tasks?.filter((t) => t.status === 'done').length ?? 0
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const cycleTimeMs = tasks ? avgMs(tasks) : null
  const leadTimeMs = tasks ? avgLeadMs(tasks) : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Project title + category */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/board/${project.id}`}
            className="text-base font-semibold text-gray-900 hover:text-blue-700 transition-colors"
          >
            {project.title}
          </Link>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0 capitalize">
            {project.category}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
        )}
      </div>

      {/* Task progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500">Tasks</span>
          {loading ? (
            <span className="text-xs text-gray-400">Loading...</span>
          ) : totalCount === 0 ? (
            <span className="text-xs text-gray-400 italic">No task board yet</span>
          ) : (
            <span className="text-xs text-gray-600 font-medium">{completedCount}/{totalCount} tasks</span>
          )}
        </div>
        {!loading && totalCount > 0 && (
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Metrics */}
      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Avg Cycle Time</p>
            <p className="text-sm font-semibold text-gray-700">
              {cycleTimeMs !== null ? formatDuration(cycleTimeMs) : '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Avg Lead Time</p>
            <p className="text-sm font-semibold text-gray-700">
              {leadTimeMs !== null ? formatDuration(leadTimeMs) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link
          href={`/board/${project.id}`}
          className="flex-1 text-center text-xs font-medium border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 py-1.5 rounded-lg transition-colors"
        >
          View Project
        </Link>
        <Link
          href={`/board/${project.id}/tasks`}
          className="flex-1 text-center text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition-colors"
        >
          Open Board
        </Link>
      </div>
    </div>
  )
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: projects, loading, error } = useProjects()

  const activeInProgress =
    projects?.filter((p) => p.status === 'active' && p.started_at !== null) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Nav */}
        <div className="mb-8">
          <Link href="/board" className="text-sm text-blue-600 hover:underline">
            ← Back to Board
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Momentum Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Active projects you&apos;ve started — task progress and cycle metrics.</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-2 bg-gray-200 rounded-full mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600 text-sm">{error.message}</p>
        ) : activeInProgress.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">
              No active projects in progress. Head to the board to start one.
            </p>
            <Link
              href="/board"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Go to Board
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInProgress.map((project) => (
              <DashboardProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
