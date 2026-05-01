#!/bin/bash
set -e
# Resolve repo root relative to this script's location (.cursor/hooks/ → ../../)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
echo "→ Formatting Prisma schema..."
cd "$REPO_ROOT/backend"
npx prisma format
echo "✓ Schema formatted"
