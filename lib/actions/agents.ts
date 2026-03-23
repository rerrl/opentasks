"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNextTaskForAgent(agentId: number) {
  try {
    const task = await prisma.task.findFirst({
      where: {
        assignedAgentId: agentId,
        status: "TODO",
      },
      orderBy: { order: "asc" },
    })
    return task
  } catch (error) {
    return null
  }
}

export async function markTaskInProgress(taskId: number) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "DONE",
        updatedAt: new Date(),
      },
    })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update task" }
  }
}
