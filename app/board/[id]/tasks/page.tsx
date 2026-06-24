'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { useProject } from '@/lib/hooks/useProjects'
import { useTasks, useTaskMutations } from '@/lib/hooks/useTasks'
import { useSteps } from '@/lib/hooks/useSteps'
import TaskCard from '@/components/tasks/TaskCard'
import type { Task, TaskStatus } from '@/lib/types'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'not_started', label: 'Not Started', color: 'bg-gray-50 border-gray-200' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'stuck',       label: 'Stuck',       color: 'bg-red-50 border-red-200'   },
  { id: 'done',        label: 'Done',         color: 'bg-green-50 border-green-200' },
]

export default function TaskBoardPage() {
  const params = useParams()
  const projectId = params.id as string

  const { data: project, loading: projectLoading } = useProject(projectId)
  const { data: tasks, loading: tasksLoading } = useTasks(projectId)
  const { data: steps, loading: stepsLoading } = useSteps(projectId)
  const { createTask, updateTaskStatus, deleteTask } = useTaskMutations()

  const [localTasks, setLocalTasks] = useState<Task[] | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [convertingAll, setConvertingAll] = useState(false)

  const displayTasks = localTasks ?? tasks ?? []

  const tasksByColumn = useCallback(
    (colId: TaskStatus) => displayTasks.filter((t) => t.status === colId),
    [displayTasks]
  )

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId as TaskStatus

    const task = displayTasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setLocalTasks(
      displayTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    try {
      const updated = await updateTaskStatus(taskId, newStatus, projectId)
      setLocalTasks((prev) =>
        (prev ?? displayTasks).map((t) => (t.id === updated.id ? updated : t))
      )
    } catch {
      // Revert
      setLocalTasks(displayTasks)
    }
  }

  async function handleAddTask() {
    const title = newTaskTitle.trim()
    if (!title) return
    setAdding(true)
    try {
      const task = await createTask(projectId, title)
      setLocalTasks([...(localTasks ?? tasks ?? []), task])
      setNewTaskTitle('')
    } finally {
      setAdding(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAddTask()
  }

  async function handleDeleteTask(id: string) {
    setLocalTasks((localTasks ?? tasks ?? []).filter((t) => t.id !== id))
    try {
      await deleteTask(id)
    } catch {
      setLocalTasks(localTasks ?? tasks ?? [])
    }
  }

  async function handleConvertStep(stepText: string) {
    const task = await createTask(projectId, stepText)
    setLocalTasks([...(localTasks ?? tasks ?? []), task])
  }

  async function handleConvertAll() {
    if (!steps || steps.length === 0) return
    setConvertingAll(true)
    try {
      const created = await Promise.all(steps.map((s) => createTask(projectId, s.text)))
      setLocalTasks([...(localTasks ?? tasks ?? []), ...created])
    } finally {
      setConvertingAll(false)
    }
  }

  const loading = projectLoading || tasksLoading || stepsLoading
  const showStepSuggestion = !loading && displayTasks.length === 0 && steps && steps.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/board/${projectId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Project
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {loading ? 'Loading...' : `${project?.title ?? 'Project'} — Task Board`}
          </h1>
        </div>

        {/* Steps → Tasks suggestion card */}
        {showStepSuggestion && (
          <div className="mb-6 border border-blue-200 bg-blue-50 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-blue-900">No tasks yet — convert steps?</h2>
                <p className="text-xs text-blue-700 mt-0.5">
                  This project has {steps!.length} step{steps!.length !== 1 ? 's' : ''} defined. Add them as tasks individually or all at once.
                </p>
              </div>
              <button
                onClick={handleConvertAll}
                disabled={convertingAll}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {convertingAll ? 'Adding...' : 'Add all as tasks'}
              </button>
            </div>
            <ul className="space-y-1.5">
              {steps!.map((step) => (
                <li key={step.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-100">
                  <span className={`flex-1 text-sm ${step.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {step.text}
                  </span>
                  {step.completed && (
                    <span className="text-xs text-gray-400 flex-shrink-0">Done in steps</span>
                  )}
                  <button
                    onClick={() => handleConvertStep(step.text)}
                    className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 hover:border-blue-400 rounded px-2 py-0.5 transition-colors"
                  >
                    + Add as task
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {COLUMNS.map((col) => {
                const colTasks = tasksByColumn(col.id)
                return (
                  <div key={col.id} className={`border rounded-xl p-3 flex flex-col min-h-[300px] ${col.color}`}>
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {col.label}
                      </h2>
                      <span className="text-xs text-gray-400 font-medium">{colTasks.length}</span>
                    </div>

                    {/* Add task input — only in Not Started column */}
                    {col.id === 'not_started' && (
                      <div className="flex gap-1.5 mb-3">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="New task..."
                          className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0"
                        />
                        <button
                          onClick={handleAddTask}
                          disabled={adding || !newTaskTitle.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* Task list */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 space-y-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'bg-white/60' : ''
                          }`}
                        >
                          {colTasks.map((task, index) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              index={index}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                          {provided.placeholder}
                          {colTasks.length === 0 && !snapshot.isDraggingOver && (
                            <p className="text-xs text-gray-400 italic text-center pt-4">Empty</p>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}
