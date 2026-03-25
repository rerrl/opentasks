---
name: opentasks-agent
description: "Claim and complete tasks from the OpenTasks local task board. Use when: agent needs to pick up work from a shared task queue, update task progress, or report task completion/failure. Triggers on phrases like 'check for tasks', 'get next task', 'what should I work on', 'mark task done', 'mark task failed'."
---

# OpenTasks Agent

Claim and complete tasks from the OpenTasks local task board via bash scripts.

## Task Lifecycle (MANDATORY)

Every task must follow this exact lifecycle. No exceptions.

```
TODO → IN_PROGRESS → DONE (or FAILED)
```

### Step 1: Claim the task
```bash
scripts/getnexttask.sh <your-agent-name>
```

### Step 2: IMMEDIATELY mark IN_PROGRESS
```bash
scripts/updatetaskstatus.sh <taskId> IN_PROGRESS
```
**This is the FIRST thing you do after claiming a task — before reading the prompt, before planning, before writing any code.** If you do ANY work without first marking IN_PROGRESS, you have broken the workflow. The board depends on accurate status to coordinate between agents.

### Step 3: Do the work
Read the prompt, plan your approach, write code, test, etc.

### Step 4: IMMEDIATELY mark DONE or FAILED when finished
```bash
scripts/updatetaskstatus.sh <taskId> DONE "summary of what was done"
```
or
```bash
scripts/updatetaskstatus.sh <taskId> FAILED "reason for failure"
```
**Do this RIGHT AFTER your last commit or action — not "later", not "when you remember."** The task is not complete until the status is updated. If you finish the work but forget to mark it DONE, the task stays IN_PROGRESS forever and blocks other agents.

## Task Fields

- `id` — integer ID
- `title` — short description
- `prompt` — detailed instructions
- `status` — TODO, IN_PROGRESS, DONE, FAILED
- `result` — completion notes or error message
- `order` — priority (lower = first)

## Rules

- **ALWAYS mark IN_PROGRESS before starting work** — this includes reading the prompt, planning, or touching any code.
- **ALWAYS mark DONE or FAILED immediately after finishing** — not later, not eventually, immediately.
- Never leave a task in IN_PROGRESS state if you are not actively working on it.
- Always complete or fail the current task before fetching the next one.
- Include useful context in the result field.
- If stuck, fail with a clear explanation rather than leaving stale.
- API defaults to `http://localhost:3000`. Override with `OPENTASKS_API_URL`.

### Result Field Examples

**On success (DONE):**
```bash
scripts/updatetaskstatus.sh 42 DONE "Deployed to staging, PR #128 merged"
scripts/updatetaskstatus.sh 42 DONE "Added dark mode toggle to settings page"
scripts/updatetaskstatus.sh 42 DONE "Migrated DB schema, ran seed script"
```

**On failure (FAILED):**
```bash
scripts/updatetaskstatus.sh 42 FAILED "Missing API key for payment service — can't reach endpoint"
scripts/updatetaskstatus.sh 42 FAILED "Build fails due to type error in UserCard.tsx:47"
scripts/updatetaskstatus.sh 42 FAILED "Task requires AWS credentials not available in this environment"
```

## Agent Name

Use your OpenClaw agent ID (e.g., `junior-dev`). You can find yours by running `openclaw status` — it's the agent name shown in the output.
