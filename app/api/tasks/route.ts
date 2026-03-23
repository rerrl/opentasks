import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { status: "TODO" },
      orderBy: { order: "asc" },
      include: { assignedAgent: true },
    })
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, prompt } = body

    if (!title || !prompt) {
      return NextResponse.json(
        { error: "title and prompt are required" },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        prompt,
        status: "TODO",
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
