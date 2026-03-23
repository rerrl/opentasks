import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(agents)
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
    const { name } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.create({
      data: { name: name.trim() },
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error("POST /api/agents error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    const message = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Agent with this name already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
