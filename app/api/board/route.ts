import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [tasks, agents] = await Promise.all([
      prisma.task.findMany({
        orderBy: { order: "asc" },
      }),
      prisma.agent.findMany({
        orderBy: { name: "asc" },
      }),
    ])

    const serializedTasks = tasks.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))

    const serializedAgents = agents.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }))

    return NextResponse.json({ tasks: serializedTasks, agents: serializedAgents })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
