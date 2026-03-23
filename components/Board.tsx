"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Plus, Settings, RefreshCw } from "lucide-react"
import { NewTaskModal } from "./NewTaskModal"
import { EditTaskModal } from "./EditTaskModal"
import { ManageAgentsModal } from "./ManageAgentsModal"
import {
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  getBoardData,
} from "@/lib/actions/tasks"

interface Task {
  id: number
  title: string
  prompt: string
  assignedAgentId: number | null
  order: number
  status: string
  createdAt: Date
  updatedAt: Date
}

interface Agent {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

interface BoardProps {
  initialTasks: Task[]
  initialAgents: Agent[]
}

export function Board({ initialTasks, initialAgents }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showManageAgents, setShowManageAgents] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Require 8px pointer movement before drag starts — lets clicks work on buttons
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const sensors = useSensors(pointerSensor)

  // Auto-refresh every 10 seconds
  const refreshBoard = useCallback(async () => {
    try {
      const data = await getBoardData()
      setTasks(data.tasks as Task[])
      setAgents(data.agents as Agent[])
      setLastRefresh(new Date())
    } catch (err) {
      // silent fail on refresh
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(refreshBoard, 10000)
    return () => clearInterval(interval)
  }, [refreshBoard])

  // Group tasks by agent
  const tasksByAgent = new Map<number | null, Task[]>()
  tasksByAgent.set(null, []) // Unassigned

  agents.forEach((agent) => {
    tasksByAgent.set(agent.id, [])
  })

  tasks.forEach((task) => {
    if (task.status === "TODO") {
      const agentTasks = tasksByAgent.get(task.assignedAgentId)
      if (agentTasks) {
        agentTasks.push(task)
      }
    }
  })

  // Sort tasks within each column by order
  tasksByAgent.forEach((taskList) => {
    taskList.sort((a, b) => a.order - b.order)
  })

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const task = tasks.find((t) => t.id.toString() === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || !activeTask) return

    const activeId = active.id.toString()
    const activeTaskIndex = tasks.findIndex(
      (t) => t.id.toString() === activeId
    )
    if (activeTaskIndex === -1) return

    const activeTaskItem = tasks[activeTaskIndex]

    if (over.data.current?.type === "column") {
      const newAgentId = over.data.current.agentId as number | null
      if (activeTaskItem.assignedAgentId !== newAgentId) {
        setTasks((prev) => {
          const newTasks = [...prev]
          newTasks[activeTaskIndex] = {
            ...newTasks[activeTaskIndex],
            assignedAgentId: newAgentId,
          }
          return newTasks
        })
      }
    } else {
      const overId = over.id.toString()
      const overTaskIndex = tasks.findIndex((t) => t.id.toString() === overId)
      if (overTaskIndex === -1) return

      const overTaskItem = tasks[overTaskIndex]
      if (activeTaskItem.assignedAgentId !== overTaskItem.assignedAgentId) {
        setTasks((prev) => {
          const newTasks = [...prev]
          newTasks[activeTaskIndex] = {
            ...newTasks[activeTaskIndex],
            assignedAgentId: overTaskItem.assignedAgentId,
          }
          return newTasks
        })
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id.toString()
    const overId = over.id.toString()

    if (activeId === overId) return

    const activeTaskIndex = tasks.findIndex(
      (t) => t.id.toString() === activeId
    )
    if (activeTaskIndex === -1) return

    const activeTaskItem = tasks[activeTaskIndex]

    // Dropping on a column (including empty ones)
    if (over.data.current?.type === "column") {
      const targetAgentId = over.data.current.agentId as number | null
      const colTasks = tasks
        .filter(
          (t) =>
            t.assignedAgentId === targetAgentId &&
            t.id !== activeTaskItem.id &&
            t.status === "TODO"
        )
        .sort((a, b) => a.order - b.order)

      const newOrder =
        colTasks.length > 0 ? colTasks[colTasks.length - 1].order + 100 : 1000

      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskItem.id
            ? { ...t, assignedAgentId: targetAgentId, order: newOrder }
            : t
        )
      )
      updateTask(activeTaskItem.id, {
        assignedAgentId: targetAgentId,
        order: newOrder,
      })
      return
    }

    // Dropping on another task
    const overTaskIndex = tasks.findIndex((t) => t.id.toString() === overId)
    if (overTaskIndex === -1) return

    const overTaskItem = tasks[overTaskIndex]

    let newOrder: number
    if (activeTaskItem.assignedAgentId === overTaskItem.assignedAgentId) {
      if (activeTaskIndex < overTaskIndex) {
        const beforeTask = tasks[overTaskIndex + 1]
        newOrder = beforeTask
          ? (overTaskItem.order + beforeTask.order) / 2
          : overTaskItem.order + 100
      } else {
        const afterTask = tasks[overTaskIndex - 1]
        newOrder = afterTask
          ? (overTaskItem.order + afterTask.order) / 2
          : overTaskItem.order - 100
      }
    } else {
      newOrder = overTaskItem.order - 50
    }

    setTasks((prev) => {
      const newTasks = [...prev]
      newTasks[activeTaskIndex] = {
        ...newTasks[activeTaskIndex],
        order: newOrder,
        assignedAgentId: overTaskItem.assignedAgentId,
      }
      return newTasks
    })

    updateTask(activeTaskItem.id, {
      order: newOrder,
      assignedAgentId: overTaskItem.assignedAgentId,
    })
  }

  async function handleCreateTask(data: { title: string; prompt: string }) {
    const result = await createTask(data)
    if (result.success && result.task) {
      setTasks((prev) => [...prev, result.task as Task])
    }
    setShowNewTask(false)
  }

  async function handleUpdateTask(
    id: number,
    data: { title: string; prompt: string }
  ) {
    const result = await updateTask(id, data)
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...data, updatedAt: new Date() } : t
        )
      )
    }
    setEditingTask(null)
  }

  async function handleDeleteTask(id: number) {
    const result = await deleteTask(id)
    if (result.success) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
  }

  async function handleCompleteTask(id: number) {
    const result = await completeTask(id)
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "DONE" } : t))
      )
    }
  }

  function handleAgentCreated(agent: Agent) {
    setAgents((prev) =>
      [...prev, agent].sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  function handleAgentDeleted(agentId: number) {
    setAgents((prev) => prev.filter((a) => a.id !== agentId))
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top navbar */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agent Task Board</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-refreshes every 10s
              {lastRefresh && <> · Last: {lastRefresh.toLocaleTimeString()}</>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refreshBoard}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowNewTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowManageAgents(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Agents
            </Button>
          </div>
        </div>
      </header>

      {/* Main board area */}
      <main className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {/* Unassigned column */}
            <AgentColumn
              agentId={null}
              agentName="Unassigned"
              tasks={tasksByAgent.get(null) || []}
              onEdit={(task) => setEditingTask(task)}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
            />

            {/* Agent columns */}
            {agents.map((agent) => (
              <AgentColumn
                key={agent.id}
                agentId={agent.id}
                agentName={agent.name}
                tasks={tasksByAgent.get(agent.id) || []}
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

      {/* Modals */}
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
        onAgentCreated={handleAgentCreated}
        onAgentDeleted={handleAgentDeleted}
      />
    </div>
  )
}
