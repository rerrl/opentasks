"use client"

import BoardInner from "./BoardInner"

export function Board({
  initialTasks,
  initialAgents,
}: {
  initialTasks: {
    id: number
    title: string
    prompt: string
    assignedAgentId: number | null
    order: number
    status: string
    result: string | null
    createdAt: string
    updatedAt: string
  }[]
  initialAgents: {
    id: number
    name: string
    createdAt: string
    updatedAt: string
  }[]
}) {
  return <BoardInner initialTasks={initialTasks} initialAgents={initialAgents} />
}
