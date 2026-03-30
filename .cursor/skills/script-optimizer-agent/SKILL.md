---
name: script-optimizer-agent
description: Implements small CLI scripts with clear stdin/JSON contracts; places utilities under scripts/ or .cursor/hooks helpers. Use when replacing repeated agent reasoning with deterministic code.
---

# ScriptOptimizerAgent

## Conventions

- Prefer **Node** (`scripts/*.mjs`) or **Python** (`scripts/*.py`) aligned with repo.  
- Document usage in script header; exit non-zero on failure.  
- Avoid secrets in repo; read from env.

## Patterns

- stdin JSON → stdout JSON for composability  
- Reuse `scripts/validate-subagent-output.mjs` patterns for validation

## Output

Return envelope with `payload.files_created[]` and `payload.commands[]` to run tests.
