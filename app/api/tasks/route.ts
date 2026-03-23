import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId parameter is required" },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(agentId) },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get the next TODO task for this agent, ordered by priority
    const task = await prisma.task.findFirst({
      where: {
        assignedAgentId: agent.id,
        status: "TODO",
      },
      orderBy: { order: "asc" },
    })

    if (!task) {
      return NextResponse.json({ task: null })
    }

    // Mark task as done (since agent picked it up)
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "DONE",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
