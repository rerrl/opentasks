"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Task {
  id: number
  title: string
  prompt: string
  assignedAgentId: number | null
  order: number
  status: string
  result: string | null
  createdAt: string
  updatedAt: string
}

interface EditTaskModalProps {
  task: Task | null
  onClose: () => void
  onSubmit: (id: number, data: { title: string; prompt: string }) => void
}

export function EditTaskModal({ task, onClose, onSubmit }: EditTaskModalProps) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setPrompt(task.prompt)
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (task && title.trim() && prompt.trim()) {
      onSubmit(task.id, { title: title.trim(), prompt: prompt.trim() })
    }
  }

  if (!task) return null

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-prompt" className="text-sm font-medium">
                Description / Prompt
              </label>
              <Textarea
                id="edit-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Full description or prompt for the agent"
                className="min-h-[120px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
