---
name: error-reporting-protocol
description: Formats failures with Syntax, Runtime, Logical, Internal, or External categories and required evidence fields. Use for every subagent JSON envelope when status is failure or partial_success, or when embedding errors in payload.
---

# Error reporting protocol

## Categories (pick one primary per error)

| Category | Use when |
|----------|----------|
| **syntax** | Language grammar/parse/compile failure |
| **runtime** | Exception during execution (divide by zero, null deref) |
| **logical** | Runs but wrong result (off-by-one, bad branch) |
| **internal** | Host limits (OOM, disk full, killed process) |
| **external** | Network, DB down, bad user input shape, third-party 503 |

## Required fields per error object

- `category` — enum above  
- `message` — **specific**; never `"Error: could not complete task"` alone  
- `stage` — e.g. `tool`, `validation`, `reasoning`  
- `evidence` — path:line, snippet, or command output  
- `suggested_next_step` — one concrete action  

## Empty vs failure

- **empty_result** — search finished, nothing matched (e.g. deprecated field absent everywhere). **Not** an error; use `status: "empty_result"` and `empty_result.negative_evidence`.  
- **failure** — cannot complete with given tools/skills; must return `errors[]` and `what_was_attempted[]`.

See `.cursor/schemas/subagent-envelope.schema.json`.
