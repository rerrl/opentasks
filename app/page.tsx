import { Board } from "@/components/Board"
import { getBoardData } from "@/lib/actions/tasks"

export default async function Home() {
  const { tasks, agents } = await getBoardData()

  return (
    <main>
      <Board initialTasks={tasks} initialAgents={agents} />
    </main>
  )
}
