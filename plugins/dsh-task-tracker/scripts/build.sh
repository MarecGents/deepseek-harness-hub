#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [ ! -f lib/index.js ]; then
  echo "build: lib/index.js missing" >&2
  exit 1
fi
node --check lib/index.js
echo "=== Build complete (lib verified) ==="
