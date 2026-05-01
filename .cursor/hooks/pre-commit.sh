#!/bin/bash
set -e
# Resolve repo root relative to this script's location (.cursor/hooks/ → ../../)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
echo "→ Running Signal Lab pre-commit checks..."

echo "  Backend typecheck..."
cd "$REPO_ROOT/backend" && npx tsc --noEmit
echo "  ✓ Backend OK"

echo "  Frontend typecheck..."
cd "$REPO_ROOT/frontend" && npx tsc --noEmit
echo "  ✓ Frontend OK"

echo "✓ All pre-commit checks passed"
