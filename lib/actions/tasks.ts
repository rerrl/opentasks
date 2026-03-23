"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTask(data: { title: string; prompt: string }) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        prompt: data.prompt,
        status: "TODO",
      },
    })
    revalidatePath("/")
    return { success: true, task }
  } catch (error) {
    return { success: false, error: "Failed to create task" }
  }
}

export async function updateTask(
  id: number,
  data: { title?: string; prompt?: string; status?: "TODO" | "DONE"; assignedAgentId?: number | null; order?: number }
) {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
    revalidatePath("/")
    return { success: true, task }
  } catch (error) {
    return { success: false, error: "Failed to update task" }
  }
}

export async function deleteTask(id: number) {
  try {
    await prisma.task.delete({
      where: { id },
    })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete task" }
  }
}

export async function completeTask(id: number) {
  return updateTask(id, { status: "DONE" })
}

export async function createAgent(data: { name: string }) {
  try {
    const agent = await prisma.agent.create({
      data: { name: data.name },
    })
    revalidatePath("/")
    return { success: true, agent }
  } catch (error) {
    return { success: false, error: "Failed to create agent" }
  }
}

export async function deleteAgent(id: number) {
  try {
    // Check if agent has assigned tasks
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { tasks: true },
    })

    if (agent && agent.tasks.length > 0) {
      return {
        success: false,
        error: "Cannot delete agent with assigned tasks. Unassign tasks first.",
      }
    }

    await prisma.agent.delete({
      where: { id },
    })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete agent" }
  }
}

export async function getAgents() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: "asc" },
    })
    return agents
  } catch (error) {
    return []
  }
}

export async function getTasks() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { order: "asc" },
    })
    return tasks
  } catch (error) {
    return []
  }
}

export async function getBoardData() {
  try {
    const [tasks, agents] = await Promise.all([
      prisma.task.findMany({
        orderBy: { order: "asc" },
      }),
      prisma.agent.findMany({
        orderBy: { name: "asc" },
      }),
    ])

    return { tasks, agents }
  } catch (error) {
    return { tasks: [], agents: [] }
  }
}

export async function updateTaskOrder(
  taskId: number,
  newAgentId: number | null,
  newOrder: number
) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedAgentId: newAgentId,
        order: newOrder,
        updatedAt: new Date(),
      },
    })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update task order" }
  }
}
