#!/usr/bin/env bash
# Syntax smoke check for the host + client halves (no bundling needed — plain ESM).
set -e
node --check lib/index.js
node --check lib/client.js
echo "dsh-usage-stats: syntax OK"
