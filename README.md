# Agent Task Board

Local-only Kanban board for assigning tasks to AI agents via drag-and-drop.

## Quick Start

```bash
npm install
npm run dev
```

That's it. `npm run dev` automatically creates the SQLite database on first run.

Open [http://localhost:3000](http://localhost:3000).

## Manual DB Commands

```bash
npm run db:push   # Create/sync the database from schema
```

## API Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/api/tasks` | — | All TODO tasks with assigned agent |
| `POST` | `/api/tasks` | `{ title, prompt }` | Create task |
| `PATCH` | `/api/tasks/:id` | Any fields | Update task |
| `DELETE` | `/api/tasks/:id` | — | Delete task |
| `GET` | `/api/agents` | — | All agents |
| `POST` | `/api/agents` | `{ name }` | Create agent |
| `DELETE` | `/api/agents/:id` | — | Delete agent |
| `GET` | `/api/tasks/next?agentName=X` | — | Pick up next task for agent |

### Agent Polling

Agents poll their next task:

```bash
curl http://localhost:3000/api/tasks/next?agentName=MyAgent
# → { "task": { "id": 1, "title": "...", "prompt": "..." } }
# → { "task": null } if nothing queued
```

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma + SQLite
- @dnd-kit (drag-and-drop)
- lucide-react icons
