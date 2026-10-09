#!/usr/bin/env bash
# Stage a folder that can be uploaded as a Hugging Face Space (SDK: docker).
# Usage: scripts/stage_hf_space.sh [output_dir]   (default: build/hf-space)
# Only the files the Dockerfile needs are copied: no node_modules, .git, .env, tests or docs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$ROOT/build/hf-space}"

rm -rf "$OUT"
mkdir -p "$OUT"

cd "$ROOT"
cp package.json package-lock.json server.js healthcheck.js "$OUT"/
cp -R middleware public routes services "$OUT"/
find "$OUT" -name .DS_Store -delete

# Root Dockerfile for the Space. Same as the repo Dockerfile except the start command:
# HF runs the container as UID 1000 with a non-writable HOME, so run node directly
# instead of `npm start` (identical behaviour: npm start is "node server.js").
if ! grep -q '^CMD \["npm", "start"\]$' Dockerfile; then
  echo "stage_hf_space.sh: expected CMD [\"npm\", \"start\"] in Dockerfile" >&2
  exit 1
fi
sed 's|^CMD \["npm", "start"\]$|CMD ["node", "server.js"]|' Dockerfile > "$OUT/Dockerfile"

cat > "$OUT/README.md" <<'YAML'
---
title: NASA TEMPO Air Quality Monitor
emoji: 🛰️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 3003
pinned: false
---

# NASA TEMPO Air Quality Monitor

Express app showing air quality index, forecast and city ranking. The data is
currently simulated. Source and details: https://github.com/Alishnis/nasaspace-app

User accounts and subscriptions are kept in memory and reset whenever this Space restarts.
YAML

echo "Staged Hugging Face Space in: $OUT"
