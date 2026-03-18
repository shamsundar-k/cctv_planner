#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$BACKEND_PID"  2>/dev/null
  wait "$BACKEND_PID"  2>/dev/null
}
trap cleanup INT TERM

echo "Starting backend..."
cd "$REPO_ROOT/packages/backend"
uv run uvicorn app.main:app --reload &
BACKEND_PID=$!


echo ""
echo "Backend  → http://localhost:8000"

echo ""
echo "Press Ctrl+C to stop both."

wait "$BACKEND_PID" 
