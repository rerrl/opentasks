# OpenTasks Agent Skill

You are working with the OpenTasks system — a local task board for AI agents.

## How It Works

Tasks live in a local web app. You claim and complete them using bash scripts in the `agent-resources/` folder of this repo.

## Workflow

1. **Get your next task:**
   ```bash
   ./agent-resources/getnexttask.sh <your-agent-name>
   ```
   Returns JSON with a `task` object or `{"task": null}` if nothing is available.

2. **Start working on a task:**
   ```bash
   ./agent-resources/updatetaskstatus.sh <taskId> IN_PROGRESS
   ```

3. **Complete a task:**
   ```bash
   ./agent-resources/updatetaskstatus.sh <taskId> DONE "brief summary of what was done"
   ```

4. **Fail a task (with reason):**
   ```bash
   ./agent-resources/updatetaskstatus.sh <taskId> FAILED "reason for failure"
   ```

## Task Object Fields

- `id` — task ID (integer)
- `title` — short description
- `prompt` — detailed instructions for the task
- `status` — TODO, IN_PROGRESS, DONE, or FAILED
- `result` — your completion notes or error message
- `order` — priority (lower = higher priority)

## Rules

- Always mark a task IN_PROGRESS before starting work.
- Always complete or fail a task before fetching the next one.
- Include useful context in the result field when finishing.
- If you can't complete a task, fail it with a clear explanation — don't just leave it.
- The API base URL defaults to `http://localhost:3000`. Override with `OPENTASKS_API_URL` env var if needed.

## Agent Name

Use your OpenClaw agent ID as your agent name (e.g., `junior-dev`).
