"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, AlertCircle } from "lucide-react"
import { createAgent, deleteAgent } from "@/lib/actions/tasks"

interface Agent {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

interface ManageAgentsModalProps {
  open: boolean
  onClose: () => void
  agents: Agent[]
  onAgentCreated: (agent: Agent) => void
  onAgentDeleted: (agentId: number) => void
}

export function ManageAgentsModal({
  open,
  onClose,
  agents,
  onAgentCreated,
  onAgentDeleted,
}: ManageAgentsModalProps) {
  const [newAgentName, setNewAgentName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newAgentName.trim()) return

    const result = await createAgent({ name: newAgentName.trim() })
    if (result.success && result.agent) {
      onAgentCreated(result.agent as Agent)
      setNewAgentName("")
    } else {
      setError(result.error || "Failed to create agent")
    }
  }

  const handleDeleteAgent = async (agentId: number) => {
    setError(null)
    const result = await deleteAgent(agentId)
    if (result.success) {
      onAgentDeleted(agentId)
    } else {
      setError(result.error || "Failed to delete agent")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Manage Agents</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {/* Add agent form */}
          <form onSubmit={handleAddAgent} className="mb-6">
            <div className="flex gap-2">
              <Input
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="Agent name"
                required
              />
              <Button type="submit">Add</Button>
            </div>
          </form>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Agent list */}
          <div className="space-y-2">
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No agents yet. Add one above.
              </p>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <span className="font-medium">{agent.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
