---
name: deterministic-parse-first
description: Prefer scripts, jq, and small CLIs to slice or validate structured data before LLM reasoning—saves tokens and yields testable outputs. Use for logs, JSON, lockfiles, OpenAPI, CSV extracts.
---

# Deterministic parse first

Use **code** to **reduce** and **structure** data before asking an LLM to reason over it. The LLM’s strength is judgment on a **small, relevant slice**—not re-parsing megabytes in context.

## When to apply

- CI logs, stack traces, or build output beyond a few dozen lines.
- JSON/YAML/OpenAPI/lockfile **extracts** (paths, versions, one field).
- Repeated transforms you might do twice the same way (`jq`, `grep -E`, small Node/Python).
- Validating subagent JSON: `node scripts/validate-subagent-output.mjs`.

## Prefer

- **Existing repo scripts** under `scripts/` and hook helpers under `.cursor/hooks/`.
- **`jq`** / **`node -e`** / **`python -c`** for one-off slices when no script exists yet.
- **Schema validation** instead of “does this JSON look right?”
- Delegating consolidation of **duplicated** shell patterns to **`script-optimizer-agent`**; **greenfield** helpers to **`tool-builder-agent`** (see coordinator routing).

## Avoid

- Pasting **large** raw blobs into chat or subagent **envelopes**.
- Asking the model to **count**, **diff**, or **parse** structured data that a 5-line script can handle.
- Re-deriving the same extract on every turn—**save** a script if it repeats (efficiency gate + script-optimizer pattern).

## Prompt caching

Project files **cannot** turn on provider prompt caching. This skill **reduces context size**, which lowers cost and latency regardless of provider. See [`.cursor/capabilities-inventory.md`](../capabilities-inventory.md) for a short note on caching vs. hooks/skills.
