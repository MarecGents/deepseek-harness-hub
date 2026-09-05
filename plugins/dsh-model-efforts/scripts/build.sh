#!/usr/bin/env bash
# Syntax gate for the plugin's two loadable halves (verify-plugin.mjs P1 runs
# node --check over lib/*.js as well; this script is the local convenience).
set -e
cd "$(dirname "$0")/.."
node --check lib/index.js
node --check lib/client.js
echo "ok: lib/index.js lib/client.js"
