"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core"
import { AgentColumn } from "./AgentColumn"
import { TaskCard } from "./TaskCard"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { NewTaskModal } from "./NewTaskModal"
import { EditTaskModal } from "./EditTaskModal"
import { ManageAgentsModal } from "./ManageAgentsModal"

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

interface BoardInnerProps {
  initialTasks: Task[]
  initialAgents: Agent[]
}

export default function BoardInner({
  initialTasks,
  initialAgents,
}: BoardInnerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showManageAgents, setShowManageAgents] = useState(false)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const sensors = useSensors(pointerSensor)

  // --- helpers ---

  async function apiPatch(url: string, body: Record<string, unknown>) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async function apiPost(url: string, body: Record<string, unknown>) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async function apiDelete(url: string) {
    const res = await fetch(url, { method: "DELETE" })
    return res.json()
  }

  // --- drag & drop ---

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id.toString() === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || !activeTask) return

    const activeIdx = tasks.findIndex(
      (t) => t.id.toString() === active.id.toString()
    )
    if (activeIdx === -1) return

    const current = tasks[activeIdx]
    let newAgentId: number | null | undefined

    if (over.data.current?.type === "column") {
      newAgentId = over.data.current.agentId as number | null
    } else {
      const overIdx = tasks.findIndex(
        (t) => t.id.toString() === over.id.toString()
      )
      if (overIdx !== -1) newAgentId = tasks[overIdx].assignedAgentId
    }

    if (newAgentId !== undefined && current.assignedAgentId !== newAgentId) {
      setTasks((prev) =>
        prev.map((t, i) =>
          i === activeIdx ? { ...t, assignedAgentId: newAgentId! } : t
        )
      )
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()
    if (activeId === overId) return

    const activeIdx = tasks.findIndex((t) => t.id.toString() === activeId)
    if (activeIdx === -1) return

    const task = tasks[activeIdx]
    let newAgentId: number | null = task.assignedAgentId
    let newOrder: number

    if (over.data.current?.type === "column") {
      // Dropped on a column (including empty ones)
      newAgentId = over.data.current.agentId as number | null
      const colTasks = tasks
        .filter(
          (t) =>
            t.assignedAgentId === newAgentId &&
            t.id !== task.id &&
            t.status === "TODO"
        )
        .sort((a, b) => a.order - b.order)
      newOrder =
        colTasks.length > 0 ? colTasks[colTasks.length - 1].order + 100 : 1000
    } else {
      // Dropped on another task
      const overIdx = tasks.findIndex((t) => t.id.toString() === overId)
      if (overIdx === -1) return
      const overTask = tasks[overIdx]
      newAgentId = overTask.assignedAgentId

      if (task.assignedAgentId === overTask.assignedAgentId) {
        if (activeIdx < overIdx) {
          const next = tasks[overIdx + 1]
          newOrder = next
            ? (overTask.order + next.order) / 2
            : overTask.order + 100
        } else {
          const prev = tasks[overIdx - 1]
          newOrder = prev
            ? (overTask.order + prev.order) / 2
            : overTask.order - 100
        }
      } else {
        newOrder = overTask.order - 50
      }
    }

    // Update local state immediately
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, assignedAgentId: newAgentId, order: newOrder } : t
      )
    )

    // Persist to DB
    await apiPatch(`/api/tasks/${task.id}`, {
      assignedAgentId: newAgentId,
      order: newOrder,
    })
  }

  // --- CRUD callbacks ---

  async function handleCreateTask(data: { title: string; prompt: string }) {
    const created = await apiPost("/api/tasks", data)
    if (created?.id) {
      setTasks((prev) => [...prev, created])
    }
    setShowNewTask(false)
  }

  async function handleUpdateTask(
    id: number,
    data: { title: string; prompt: string }
  ) {
    await apiPatch(`/api/tasks/${id}`, data)
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    )
    setEditingTask(null)
  }

  async function handleDeleteTask(id: number) {
    await apiDelete(`/api/tasks/${id}`)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleCompleteTask(id: number) {
    await apiPatch(`/api/tasks/${id}`, { status: "DONE" })
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "DONE" } : t))
    )
  }

  async function handleCreateAgent(name: string): Promise<Agent | null> {
    const created = await apiPost("/api/agents", { name })
    if (created?.id) {
      setAgents((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      )
      return created
    }
    return null
  }

  async function handleDeleteAgent(agentId: number): Promise<boolean> {
    const res = await apiDelete(`/api/agents/${agentId}`)
    if (res?.success !== false) {
      setAgents((prev) => prev.filter((a) => a.id !== agentId))
      return true
    }
    return false
  }

  // --- render ---

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agent Task Board</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowNewTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button variant="outline" onClick={() => setShowManageAgents(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Agents
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            <AgentColumn
              agentId={null}
              agentName="Unassigned"
              tasks={tasks
                .filter((t) => t.assignedAgentId === null && t.status === "TODO")
                .sort((a, b) => a.order - b.order)}
              onEdit={(task) => setEditingTask(task)}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
            />

            {agents.map((agent) => (
              <AgentColumn
                key={agent.id}
                agentId={agent.id}
                agentName={agent.name}
                tasks={tasks
                  .filter(
                    (t) => t.assignedAgentId === agent.id && t.status === "TODO"
                  )
                  .sort((a, b) => a.order - b.order)}
                onEdit={(task) => setEditingTask(task)}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onComplete={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <NewTaskModal
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        onSubmit={handleCreateTask}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
      />

      <ManageAgentsModal
        open={showManageAgents}
        onClose={() => setShowManageAgents(false)}
        agents={agents}
        onCreateAgent={handleCreateAgent}
        onDeleteAgent={handleDeleteAgent}
      />
    </div>
  )
}
