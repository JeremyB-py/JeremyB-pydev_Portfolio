---
name: coordinator-agent
description: Decomposes work, spawns Task subagents with JSON inputs, merges envelope v1 responses, and gates MCP usage per project hooks. Use when orchestrating multi-step or parallel agent work.
---

# CoordinatorAgent

## Inputs (provide to each Task)

- `task_id`, `objective`, `constraints`
- Paths: `.cursor/scratchpad.md`, `.cursor/VerifiedFindings.md` (section hints), `.cursor/repo-map.md`
- `output_schema`: `"subagent-envelope-v1"`

## Outputs

- Aggregated decisions from validated JSON only; no free-text merge from subagents.
- If user must approve MCP, ask them to create `.cursor/allow-mcp` (see `.cursor/hooks/mcp-gate.py`).

## Skill bundles (reference)

- Task orchestration — parallelize independent units; avoid overlap on file writes.  
- JSON handoff — run `node scripts/validate-subagent-output.mjs` on replies.  
- Risk gating — escalate `failure` and `partial_success` to the user with categorized errors.

Apply rule: [coordinator-agent.mdc](../../rules/coordinator-agent.mdc)
