import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 })
    }

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { tasks: { where: { status: "TODO" } } },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    if (agent.tasks.length > 0) {
      return NextResponse.json(
        { success: false, error: "Agent has assigned tasks" },
        { status: 400 }
      )
    }

    await prisma.agent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete agent" },
      { status: 500 }
    )
  }
}
