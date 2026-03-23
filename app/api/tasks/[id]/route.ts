import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, prompt, assignedAgentId, order, status, result } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (prompt !== undefined) updateData.prompt = prompt
    if (assignedAgentId !== undefined) updateData.assignedAgentId = assignedAgentId
    if (order !== undefined) updateData.order = order
    if (status !== undefined) updateData.status = status
    if (result !== undefined) updateData.result = result

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: "Task not found or update failed" },
      { status: 404 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Task not found or delete failed" },
      { status: 404 }
    )
  }
}
