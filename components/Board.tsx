"use client"

import dynamic from "next/dynamic"

const BoardInner = dynamic(() => import("@/components/BoardInner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Loading board...</p>
    </div>
  ),
})

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
