---
name: subagent-json-envelope
description: Fills and validates subagent JSON response envelope v1 (success, partial_success, empty_result, failure) for Task handoffs. Use whenever returning structured results to the coordinator.
---

# Subagent JSON envelope (v1)

## Required top-level fields

- `agent` — your persona id (e.g. `repo-explorer-agent`)
- `schema_version` — `"1"`
- `status` — one of: `success` | `partial_success` | `empty_result` | `failure`

## Optional: `coordinator_alerts`

When something **surprised** or **confused** you but you still completed (or usefully emptied) the task, add **`coordinator_alerts[]`** at the **root** of the envelope so **CoordinatorAgent** can merge and optionally route **`cataloger-agent`** to **`.cursor/UNEXPECTEDRESULTS.md`**. See **`@unexpected-coordinator-alert`**.

## Status rules

| status | When | Required |
|--------|------|----------|
| `success` | Task completed | `payload` |
| `partial_success` | Partly done | `payload` (and optional `errors[]`) |
| `empty_result` | Search done, **nothing found** (informative) | `empty_result` object with `query_summary`, `scope`, `negative_evidence` |
| `failure` | Cannot complete | `errors[]` (categorized) and `what_was_attempted[]` |

Never return empty `{}`. For failures, use `@error-reporting-protocol` categories: `syntax`, `runtime`, `logical`, `internal`, `external`.

## Validate

```bash
node scripts/validate-subagent-output.mjs path/to/response.json
```

Schema reference: `.cursor/schemas/subagent-envelope.schema.json` and `error-object.schema.json`.
