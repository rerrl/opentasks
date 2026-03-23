#!/usr/bin/env bash
# Update a task's status
# Usage:
#   ./updatetaskstatus.sh <taskId> DONE
#   ./updatetaskstatus.sh <taskId> FAILED "error message here"
#   ./updatetaskstatus.sh <taskId> IN_PROGRESS
#
# Valid statuses: TODO, IN_PROGRESS, DONE, FAILED

set -euo pipefail

TASK_ID="${1:?Usage: updatetaskstatus.sh <taskId> <STATUS> [result]}"
STATUS="${2:?Usage: updatetaskstatus.sh <taskId> <STATUS> [result]}"
RESULT="${3:-}"
BASE_URL="${OPENTASKS_API_URL:-http://localhost:3000}"

# Validate status
case "$STATUS" in
  TODO|IN_PROGRESS|DONE|FAILED) ;;
  *) echo "Error: Invalid status '$STATUS'. Valid: TODO, IN_PROGRESS, DONE, FAILED" >&2; exit 1 ;;
esac

# Build JSON payload
if [ -n "$RESULT" ]; then
  PAYLOAD=$(jq -n --arg status "$STATUS" --arg result "$RESULT" '{status: $status, result: $result}')
else
  PAYLOAD=$(jq -n --arg status "$STATUS" '{status: $status}')
fi

curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "${BASE_URL}/api/tasks/${TASK_ID}"
