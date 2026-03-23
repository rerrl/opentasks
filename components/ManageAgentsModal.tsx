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

interface Agent {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface ManageAgentsModalProps {
  open: boolean
  onClose: () => void
  agents: Agent[]
  onCreateAgent: (name: string) => Promise<Agent | null>
  onDeleteAgent: (agentId: number) => Promise<boolean>
}

export function ManageAgentsModal({
  open,
  onClose,
  agents,
  onCreateAgent,
  onDeleteAgent,
}: ManageAgentsModalProps) {
  const [newAgentName, setNewAgentName] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleAddAgent(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const name = newAgentName.trim()
    if (!name) return

    const agent = await onCreateAgent(name)
    if (agent) {
      setNewAgentName("")
    } else {
      setError("Failed to create agent")
    }
  }

  async function handleDeleteAgent(agentId: number) {
    setError(null)
    const ok = await onDeleteAgent(agentId)
    if (!ok) {
      setError("Failed to delete agent (may have assigned tasks)")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Manage Agents</DialogTitle>
        </DialogHeader>
        <div className="py-4">
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

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

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
