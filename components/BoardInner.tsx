"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AgentColumn } from "./AgentColumn"
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
  const [showNewTask, setShowNewTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showManageAgents, setShowManageAgents] = useState(false)

  // Track if user is mid-action to avoid disruptive refreshes
  const isInteracting = useRef(false)
  const markInteracting = useCallback(() => {
    isInteracting.current = true
    clearTimeout((markInteracting as any)._timeout)
    ;(markInteracting as any)._timeout = setTimeout(() => {
      isInteracting.current = false
    }, 3000)
  }, [])

  // Auto-refresh every 10s
  useEffect(() => {
    let cancelled = false

    async function refresh() {
      if (isInteracting.current) return
      try {
        const res = await fetch("/api/board", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setTasks(data.tasks)
        setAgents(data.agents)
      } catch {
        // swallow — next tick will retry
      }
    }

    const interval = setInterval(refresh, 10_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

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

  // --- assign task to agent ---

  async function handleAssign(taskId: number, agentId: number | null) {
    markInteracting()
    // Put at bottom of the target column
    const colTasks = tasks
      .filter(
        (t) =>
          t.assignedAgentId === agentId &&
          t.id !== taskId &&
          (t.status === "TODO" || t.status === "IN_PROGRESS")
      )
      .sort((a, b) => a.order - b.order)
    const newOrder = colTasks.length > 0 ? colTasks[colTasks.length - 1].order + 100 : 1000

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assignedAgentId: agentId, order: newOrder } : t
      )
    )
    await apiPatch(`/api/tasks/${taskId}`, { assignedAgentId: agentId, order: newOrder })
  }

  // --- move task within column ---

  async function handleMove(taskId: number, direction: "up" | "down" | "top" | "bottom") {
    markInteracting()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const colTasks = tasks
      .filter(
        (t) =>
          t.assignedAgentId === task.assignedAgentId &&
          (t.status === "TODO" || t.status === "IN_PROGRESS")
      )
      .sort((a, b) => a.order - b.order)

    const idx = colTasks.findIndex((t) => t.id === taskId)
    if (idx === -1) return

    let newOrder: number

    if (direction === "top") {
      newOrder = colTasks[0].order - 100
    } else if (direction === "bottom") {
      newOrder = colTasks[colTasks.length - 1].order + 100
    } else if (direction === "up" && idx > 0) {
      const above = colTasks[idx - 1]
      const aboveAbove = colTasks[idx - 2]
      newOrder = aboveAbove ? (above.order + aboveAbove.order) / 2 : above.order - 50
    } else if (direction === "down" && idx < colTasks.length - 1) {
      const below = colTasks[idx + 1]
      const belowBelow = colTasks[idx + 2]
      newOrder = belowBelow ? (below.order + belowBelow.order) / 2 : below.order + 50
    } else {
      return
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, order: newOrder } : t))
    )
    await apiPatch(`/api/tasks/${taskId}`, { order: newOrder })
  }

  // --- CRUD ---

  async function handleCreateTask(data: { title: string; prompt: string }) {
    markInteracting()
    const created = await apiPost("/api/tasks", data)
    if (created?.id) {
      setTasks((prev) => [...prev, created])
    }
    setShowNewTask(false)
  }

  async function handleUpdateTask(id: number, data: { title: string; prompt: string }) {
    markInteracting()
    await apiPatch(`/api/tasks/${id}`, data)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
    setEditingTask(null)
  }

  async function handleDeleteTask(id: number) {
    markInteracting()
    await apiDelete(`/api/tasks/${id}`)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleCompleteTask(id: number) {
    markInteracting()
    await apiPatch(`/api/tasks/${id}`, { status: "DONE" })
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "DONE" } : t)))
  }

  async function handleCreateAgent(name: string): Promise<Agent | null> {
    markInteracting()
    const created = await apiPost("/api/agents", { name })
    if (created?.id) {
      setAgents((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    }
    return null
  }

  async function handleDeleteAgent(agentId: number): Promise<boolean> {
    markInteracting()
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
        <div className="flex gap-4 h-full">
          <AgentColumn
            agentId={null}
            agentName="Unassigned"
            tasks={tasks.filter((t) => t.assignedAgentId === null)}
            agents={agents}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
            onAssign={handleAssign}
            onMove={handleMove}
          />

          {agents.map((agent) => (
            <AgentColumn
              key={agent.id}
              agentId={agent.id}
              agentName={agent.name}
              tasks={tasks.filter((t) => t.assignedAgentId === agent.id)}
              agents={agents}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
              onAssign={handleAssign}
              onMove={handleMove}
            />
          ))}
        </div>
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
