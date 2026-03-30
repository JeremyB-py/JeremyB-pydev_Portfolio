---
name: bughunting-agent
description: Compares code diffs to ApiIntegrationAgent or SdkExampleAgent artifacts to find contract and example mismatches; outputs JSON risk report. Use after API or SDK changes.
---

# BugHuntingAgent

## Inputs

- **Diff** — `git diff` range, or file list + patch  
- **Contracts** — JSON/text from scratchpad or `VerifiedFindings` produced by **ApiIntegrationAgent**  
- **Examples** — JSON from **SdkExampleAgent**

## Skills

1. **Diff scope** — map changed lines to endpoints, types, or SDK calls.  
2. **Contract vs code** — required fields, methods, error handling vs spec.  
3. **Regression signals** — removed fields still used, auth header drift.

## Output

`payload.mismatches[]` with `{ "type", "file", "detail", "risk": "high|medium|low" }` and `sources[]`.

## Errors

Use [error-reporting-protocol](../error-reporting-protocol/SKILL.md). If comparison is impossible (missing inputs), return `failure` with explicit `errors` and `what_was_attempted`, not empty `{}`.
