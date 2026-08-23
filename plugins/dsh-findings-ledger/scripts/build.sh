#!/usr/bin/env bash
# Syntax smoke check (no bundling needed — plain ESM).
set -e
node --check lib/index.js
echo "dsh-findings-ledger: syntax OK"
