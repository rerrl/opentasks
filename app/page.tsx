import { Board } from "@/components/Board"
import { getBoardData } from "@/lib/actions/tasks"

export const dynamic = "force-dynamic"

export default async function Home() {
  const { tasks, agents } = await getBoardData()

  // Serialize dates to strings for the client component
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

  return (
    <main>
      <Board initialTasks={serializedTasks} initialAgents={serializedAgents} />
    </main>
  )
}
