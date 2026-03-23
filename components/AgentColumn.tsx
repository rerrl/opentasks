"use client"

import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { TaskCard } from "./TaskCard"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: number
  title: string
  prompt: string
  assignedAgentId: number | null
  order: number
  status: string
  createdAt: string
  updatedAt: string
}

interface AgentColumnProps {
  agentId: number | null
  agentName: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onComplete: (taskId: number) => void
}

export function AgentColumn({
  agentId,
  agentName,
  tasks,
  onEdit,
  onDelete,
  onComplete,
}: AgentColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: agentId?.toString() || "unassigned",
    data: {
      type: "column",
      agentId,
    },
  })

  const taskIds = tasks.map((task) => task.id.toString())

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] max-w-[280px] h-full rounded-lg border bg-card ${
        isOver ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{agentName}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
