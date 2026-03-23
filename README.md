# Agent Task Board

Local-only Kanban board for assigning tasks to AI agents via drag-and-drop.

## Setup

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | All TODO tasks with assigned agent |
| POST | `/api/tasks` | Create task `{ title, prompt }` |
| PATCH | `/api/tasks/:id` | Update task fields |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/agents` | All agents |
| POST | `/api/agents` | Create agent `{ name }` |
| GET | `/api/tasks/next?agentName=X` | Pick up next task for agent |

### Agent Polling

Agents poll their next task:

```bash
curl http://localhost:3000/api/tasks/next?agentName=MyAgent
# → { "task": { "id": 1, "title": "...", "prompt": "..." } }
# → { "task": null } if nothing queued
```

## Stack

- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite
- @dnd-kit (drag-and-drop)
- lucide-react icons
