---
name: opentasks-agent
description: "Claim and complete tasks from the OpenTasks local task board. Use when: agent needs to pick up work from a shared task queue, update task progress, or report task completion/failure. Triggers on phrases like 'check for tasks', 'get next task', 'what should I work on', 'mark task done', 'mark task failed'."
---

# OpenTasks Agent

Claim and complete tasks from the OpenTasks local task board via bash scripts.

## Workflow

1. **Claim next task:**
   ```bash
   scripts/getnexttask.sh <your-agent-name>
   ```
   Returns `{"task": {...}}` or `{"task": null}`.

2. **⚠️ Mark IN_PROGRESS immediately — before touching any code:**
   ```bash
   scripts/updatetaskstatus.sh <taskId> IN_PROGRESS
   ```
   **This is mandatory.** Do not start any work until this succeeds. If you skip this step, you've already broken the workflow.

3. **Do the work.**

4. **Complete with notes:**
   ```bash
   scripts/updatetaskstatus.sh <taskId> DONE "summary of what was done"
   ```

5. **Or fail with reason:**
   ```bash
   scripts/updatetaskstatus.sh <taskId> FAILED "reason for failure"
   ```

## Task Fields

- `id` — integer ID
- `title` — short description
- `prompt` — detailed instructions
- `status` — TODO, IN_PROGRESS, DONE, FAILED
- `result` — completion notes or error message
- `order` — priority (lower = first)

## Rules

- Always mark IN_PROGRESS before starting work.
- Always complete or fail a task before fetching the next one.
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
