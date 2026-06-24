'use client'

import { Droppable } from '@hello-pangea/dnd'

interface BoardColumnProps {
  title: string
  droppableId: string
  children: React.ReactNode
  isDoneColumn?: boolean
}

export default function BoardColumn({
  title,
  droppableId,
  children,
  isDoneColumn = false,
}: BoardColumnProps) {
  const columnEl = (
    <div
      className={`rounded-xl p-3 min-h-[200px] flex flex-col gap-2 ${
        isDoneColumn ? 'bg-gray-100/60' : 'bg-gray-50'
      }`}
    >
      {children}
    </div>
  )

  return (
    <div className="flex flex-col gap-2 min-w-[260px] flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <h2
          className={`text-sm font-semibold tracking-wide uppercase ${
            isDoneColumn ? 'text-gray-400' : 'text-gray-700'
          }`}
        >
          {title}
        </h2>
      </div>

      {/* Column body — droppable only for active columns */}
      {isDoneColumn ? (
        columnEl
      ) : (
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`rounded-xl p-3 min-h-[200px] flex flex-col gap-2 transition-colors ${
                snapshot.isDraggingOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-gray-50'
              }`}
            >
              {children}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  )
}
