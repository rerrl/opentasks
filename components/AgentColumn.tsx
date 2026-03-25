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
  result: string | null
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
  // Group and sort: IN_PROGRESS first, then TODO (by order), then FAILED, then DONE
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS")
  const todo = tasks
    .filter((t) => t.status === "TODO")
    .sort((a, b) => a.order - b.order)
  const failed = tasks
    .filter((t) => t.status === "FAILED")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const done = tasks
    .filter((t) => t.status === "DONE")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const activeTasks = [...inProgress, ...todo]
  const archivedTasks = [...failed, ...done]

  function getPosition(
    task: Task,
    list: Task[]
  ): "first" | "middle" | "last" | "only" {
    if (list.length === 1) return "only"
    const idx = list.findIndex((t) => t.id === task.id)
    if (idx === 0) return "first"
    if (idx === list.length - 1) return "last"
    return "middle"
  }

  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px] h-full rounded-lg border bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{agentName}</h3>
          <div className="flex gap-1">
            {inProgress.length > 0 && (
              <Badge className="text-[10px] px-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {inProgress.length} IP
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {todo.length} todo
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        {/* Active tasks: IN_PROGRESS + TODO */}
        {activeTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            agents={agents}
            position={getPosition(task, activeTasks)}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onAssign={onAssign}
            onMove={activeTasks.length > 1 ? onMove : () => {}}
          />
        ))}

        {/* Archived tasks: FAILED + DONE */}
        {archivedTasks.length > 0 && (
          <>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Completed / Failed
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {archivedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                agents={agents}
                position="only"
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                onAssign={onAssign}
                onMove={() => {}}
              />
            ))}
          </>
        )}

        {activeTasks.length === 0 && archivedTasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No tasks
          </p>
        )}
      </div>
    </div>
  )
}
