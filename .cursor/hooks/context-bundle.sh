#!/usr/bin/env bash
# Optional: print paths for pasting into Task prompts (run from repo root).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
echo "Scratchpad: ${ROOT}/.cursor/scratchpad.md"
echo "VerifiedFindings: ${ROOT}/.cursor/VerifiedFindings.md"
echo "Repo map: ${ROOT}/.cursor/repo-map.md"
echo "Schemas: ${ROOT}/.cursor/schemas/"
