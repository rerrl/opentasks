import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentName = searchParams.get("agentName")

    if (!agentName) {
      return NextResponse.json(
        { error: "agentName parameter is required" },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.findUnique({
      where: { name: agentName },
    })

    if (!agent) {
      return NextResponse.json({ task: null })
    }

    const task = await prisma.task.findFirst({
      where: {
        assignedAgentId: agent.id,
        status: "TODO",
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ task: task || null })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
