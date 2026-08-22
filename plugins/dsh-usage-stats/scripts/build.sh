#!/bin/bash
# Build @dsh-external/dsh-usage-stats: hand-built ESM — verify lib/ is present and pack.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [ ! -f lib/index.js ] || [ ! -f lib/client.js ]; then
  echo "build: lib/index.js or lib/client.js missing" >&2
  exit 1
fi
node --check lib/index.js
node --check lib/client.js
echo "=== Build complete (lib verified) ==="
