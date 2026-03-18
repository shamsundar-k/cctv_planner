#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$FRONTEND_PID" 2>/dev/null
  wait "$FRONTEND_PID" 2>/dev/null
}
trap cleanup INT TERM



echo "Starting frontend..."
cd "$REPO_ROOT/packages/frontend"
pnpm dev &
FRONTEND_PID=$!

echo ""

echo "Frontend → http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both."

wait "$FRONTEND_PID"
