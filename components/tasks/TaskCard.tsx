'use client'

import { Draggable } from '@hello-pangea/dnd'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  index: number
  onDelete: (id: string) => void
}

export default function TaskCard({ task, index, onDelete }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group flex items-start justify-between gap-2 bg-white border rounded-lg px-3 py-2.5 shadow-sm cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging ? 'shadow-md border-blue-300' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-sm text-gray-800 flex-1 min-w-0 break-words">{task.title}</span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-base leading-none flex-shrink-0 transition-opacity mt-0.5"
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      )}
    </Draggable>
  )
}
