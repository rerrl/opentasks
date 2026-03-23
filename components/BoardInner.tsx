"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    // Read tasks from state (not from a stale closure)
    // We use a functional updater below, so we need the current snapshot
    // for our calculations. Grab it fresh.
    let newAgentId: number | null
    let newOrder: number
    let taskId: number

    if (over.data.current?.type === "column") {
      // Dropped on a column header / empty zone
      const targetAgentId = over.data.current.agentId as number | null

      // Find the task we dropped
      const droppedTask = tasks.find((t) => t.id.toString() === activeId)
      if (!droppedTask) return

      taskId = droppedTask.id
      newAgentId = targetAgentId

      // Order: below all existing tasks in that column
      const colTasks = tasks
        .filter(
          (t) =>
            t.assignedAgentId === targetAgentId &&
            t.id !== droppedTask.id &&
            t.status === "TODO"
        )
        .sort((a, b) => a.order - b.order)

      newOrder =
        colTasks.length > 0 ? colTasks[colTasks.length - 1].order + 100 : 1000
    } else if (activeId !== overId) {
      // Dropped on another task card
      const droppedTask = tasks.find((t) => t.id.toString() === activeId)
      const targetTask = tasks.find((t) => t.id.toString() === overId)
      if (!droppedTask || !targetTask) return

      taskId = droppedTask.id
      newAgentId = targetTask.assignedAgentId

      // Insert relative to the target task
      const colTasks = tasks
        .filter(
          (t) =>
            t.assignedAgentId === targetTask.assignedAgentId &&
            t.id !== droppedTask.id &&
            t.status === "TODO"
        )
        .sort((a, b) => a.order - b.order)

      const targetIdx = colTasks.findIndex((t) => t.id === targetTask.id)

      if (targetIdx === 0) {
        // Target is first — go above it
        newOrder = targetTask.order - 50
      } else if (targetIdx === colTasks.length - 1) {
        // Target is last — go below it
        newOrder = targetTask.order + 50
      } else {
        // Between target and the one after it
        newOrder = (targetTask.order + colTasks[targetIdx + 1].order) / 2
      }
    } else {
      return
    }

    // Update local state
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assignedAgentId: newAgentId, order: newOrder }
          : t
      )
    )

    // Persist
    await apiPatch(`/api/tasks/${taskId}`, {
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
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
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
