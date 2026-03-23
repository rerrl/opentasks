"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, CheckCircle, GripVertical } from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: number
  title: string
  prompt: string
  assignedAgentId: number | null
  order: number
  status: string
  createdAt: string
  updatedAt: string
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onComplete: (taskId: number) => void
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
    data: {
      type: "task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`mb-3 ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          {/* Drag handle — grip icon + title */}
          <div className="flex items-start gap-1 flex-1 min-w-0">
            <div
              {...listeners}
              className="flex items-start gap-1 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <CardTitle className="text-sm font-semibold line-clamp-1">
                {task.title}
              </CardTitle>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">
            #{task.id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {task.prompt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {format(new Date(task.createdAt), "MMM d, yyyy")}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onComplete(task.id)}
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
