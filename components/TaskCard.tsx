"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Trash2,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react"
import { format } from "date-fns"

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-blue-100 text-blue-800",
  "IN-PROGRESS": "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
}

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

interface Agent {
  id: number
  name: string
}

interface TaskCardProps {
  task: Task
  agents: Agent[]
  position: "first" | "middle" | "last" | "only"
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onComplete: (taskId: number) => void
  onAssign: (taskId: number, agentId: number | null) => void
  onMove: (taskId: number, direction: "up" | "down" | "top" | "bottom") => void
}

export function TaskCard({
  task,
  agents,
  position,
  onEdit,
  onDelete,
  onComplete,
  onAssign,
  onMove,
}: TaskCardProps) {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold line-clamp-1 flex-1">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 ${STATUS_COLORS[task.status] || ""}`}
            >
              {task.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              #{task.id}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.prompt}
        </p>

        {/* Show result if present */}
        {task.result && (
          <div
            className={`text-xs p-2 rounded border ${
              task.status === "FAILED"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <span className="font-medium">Result:</span> {task.result}
          </div>
        )}

        {/* Agent assignment dropdown */}
        <select
          className="w-full text-xs border rounded px-2 py-1 bg-background"
          value={task.assignedAgentId ?? ""}
          onChange={(e) =>
            onAssign(
              task.id,
              e.target.value === "" ? null : parseInt(e.target.value)
            )
          }
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Actions row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {format(new Date(task.createdAt), "MMM d, yyyy")}
          </span>

          <div className="flex items-center gap-1">
            {/* Move buttons */}
            {position !== "first" && position !== "only" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onMove(task.id, "top")}
                  title="Move to top"
                >
                  <ArrowUpToLine className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onMove(task.id, "up")}
                  title="Move up"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
              </>
            )}
            {position !== "last" && position !== "only" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onMove(task.id, "down")}
                  title="Move down"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onMove(task.id, "bottom")}
                  title="Move to bottom"
                >
                  <ArrowDownToLine className="h-3 w-3" />
                </Button>
              </>
            )}

            {/* Action buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onComplete(task.id)}
              title="Complete"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onEdit(task)}
              title="Edit"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => onDelete(task.id)}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
