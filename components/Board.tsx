"use client"

import { useEffect, useState } from "react"

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

// Dynamically import the real Board with SSR disabled
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
  initialTasks: Task[]
  initialAgents: Agent[]
}) {
  return <BoardInner initialTasks={initialTasks} initialAgents={initialAgents} />
}
