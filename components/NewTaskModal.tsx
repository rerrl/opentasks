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
import { Textarea } from "@/components/ui/textarea"

const REPOS = [
  { label: "rerrl/dprogram.me", value: "rerrl/dprogram.me" },
  { label: "rerrl/dprogram.me-be", value: "rerrl/dprogram.me-be" },
  { label: "rerrl/opentasks", value: "rerrl/opentasks" },
  { label: "rerrl/daily-planner-app", value: "rerrl/daily-planner-app" },
]

interface NewTaskModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; prompt: string }) => void
}

export function NewTaskModal({ open, onClose, onSubmit }: NewTaskModalProps) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [repo, setRepo] = useState("")
  const [branch, setBranch] = useState("")
  const [openPR, setOpenPR] = useState(false)

  function buildFinalPrompt(): string {
    const parts: string[] = []

    // Prepend repo + branch context
    if (repo || branch) {
      const header: string[] = []
      if (repo) {
        header.push(`This task involves the ${repo} repo. Clone it from https://github.com/${repo}.`)
      }
      if (branch) {
        header.push(`Create a new feature branch off of "${branch}" for your changes.`)
      }
      parts.push(header.join("\n"))
    }

    // User's description
    parts.push(prompt.trim())

    // Append PR + ping instructions
    if (openPR) {
      const baseBranch = branch || "master"
      parts.push(
        `When you're done, open a PR targeting the "${baseBranch}" branch and ping andrew (boss) via Telegram with the link to the PR.`
      )
    }

    return parts.join("\n\n")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && prompt.trim()) {
      onSubmit({ title: title.trim(), prompt: buildFinalPrompt() })
      setTitle("")
      setPrompt("")
      setRepo("")
      setBranch("")
      setOpenPR(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setPrompt("")
    setRepo("")
    setBranch("")
    setOpenPR(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Left column: metadata */}
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="repo" className="text-sm font-medium">
                  Repo
                </label>
                <select
                  id="repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">None</option>
                  {REPOS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="branch" className="text-sm font-medium">
                  Branch
                </label>
                <Input
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. migration-master (optional)"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="openPR"
                  checked={openPR}
                  onChange={(e) => setOpenPR(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <label htmlFor="openPR" className="text-sm font-medium cursor-pointer">
                  Open PR &amp; Ping when done
                </label>
              </div>
            </div>

            {/* Right column: prompt input + preview */}
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label htmlFor="prompt" className="text-sm font-medium">
                  Description / Prompt
                </label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What needs to be done"
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* Full prompt preview */}
              {(repo || branch || openPR || prompt) && (
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Full Prompt Preview
                  </label>
                  <div className="rounded-md border bg-muted/50 p-2 text-xs leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap break-words">
                    {buildFinalPrompt() || "—"}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
