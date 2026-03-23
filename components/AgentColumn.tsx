"use client"

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

interface Agent {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface AgentColumnProps {
  agentId: number | null
  agentName: string
  tasks: Task[]
  agents: Agent[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onComplete: (taskId: number) => void
  onAssign: (taskId: number, agentId: number | null) => void
  onMove: (taskId: number, direction: "up" | "down" | "top" | "bottom") => void
}

export function AgentColumn({
  agentId,
  agentName,
  tasks,
  agents,
  onEdit,
  onDelete,
  onComplete,
  onAssign,
  onMove,
}: AgentColumnProps) {
  const sorted = [...tasks].sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px] h-full rounded-lg border bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{agentName}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        {sorted.map((task, i) => {
          let position: "first" | "middle" | "last" | "only" = "middle"
          if (sorted.length === 1) position = "only"
          else if (i === 0) position = "first"
          else if (i === sorted.length - 1) position = "last"

          return (
            <TaskCard
              key={task.id}
              task={task}
              agents={agents}
              position={position}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onAssign={onAssign}
              onMove={onMove}
            />
          )
        })}
      </div>
    </div>
  )
}
