#!/usr/bin/env bash
# Get the next TODO task assigned to an agent
# Usage: ./getnexttask.sh <agentName>
# Output: JSON task object or {"task":null} if no tasks available

set -euo pipefail

AGENT_NAME="${1:?Usage: getnexttask.sh <agentName>}"
BASE_URL="${OPENTASKS_API_URL:-http://localhost:3000}"

curl -s "${BASE_URL}/api/tasks/next?agentName=${AGENT_NAME}"
