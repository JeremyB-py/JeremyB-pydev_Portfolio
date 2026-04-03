# Multi-agent toolkit plan — implementation outcomes

This document records what was implemented for plan **cursor_multi-agent_toolkit_554b7bbd** (Coordinator/Cataloger pipeline, hooks, skills, scripts).

## Skills vs subagents (Cursor)

Per [Cursor docs](https://cursor.com/docs/context/skills):

- **Skills** — Reusable **workflows** in `.cursor/skills/<skill-name>/SKILL.md` (folder + `SKILL.md`, `name` matches folder). Invoked with `/skill-name` or `@skill-name`.
- **Custom subagents** — Specialist **personas** in **`.cursor/agents/*.md`** (one markdown file per subagent, YAML frontmatter with `name`, `description`, optional `model`, `readonly`). Cursor’s documented path is **`agents`**, not `subagents`; invoke with `/agent-file-basename` (e.g. `/coordinator-agent`).

Personas were **migrated** from `.cursor/skills/` into [`.cursor/agents/`](.cursor/agents/README.md). Remaining skills are workflow-only (see [`.cursor/skills/README.md`](.cursor/skills/README.md)).

## Summary

| Area | Outcome |
|------|---------|
| **Schemas & templates** | JSON envelope + error object schemas; `scratchpad.md`, `VerifiedFindings.md`, `repo-map.md`; doc-cache with `.gitignore` |
| **Coordinator / Cataloger** | Rules (`.mdc`); **subagents** [`.cursor/agents/coordinator-agent.md`](.cursor/agents/coordinator-agent.md), [`cataloger-agent.md`](.cursor/agents/cataloger-agent.md); slash command [`.cursor/commands/coordinate-task.md`](.cursor/commands/coordinate-task.md); **Task `subagent_type`** must match YAML **`name`** (Phase 1 refinement; routing table in coordinator rule) |
| **Hooks** | [`.cursor/hooks.json`](.cursor/hooks.json): `beforeMCPExecution` (fail-closed), `subagentStart` / `subagentStop` session marker |
| **Explorers** | Subagents [`repo-explorer-agent.md`](.cursor/agents/repo-explorer-agent.md), [`database-explorer-agent.md`](.cursor/agents/database-explorer-agent.md); doc-cache convention |
| **Playwright** | Local `scripts/` npm package `@playwright/cli`; `playwright-cli install --skills`; upstream skill pack under `scripts/.claude/skills/playwright-cli/` |
| **Efficiency loop** | Subagents [`efficiency-inspector-agent.md`](.cursor/agents/efficiency-inspector-agent.md) (pre-pass gate), [`script-optimizer-agent.md`](.cursor/agents/script-optimizer-agent.md) (refactor repetition), [`tool-builder-agent.md`](.cursor/agents/tool-builder-agent.md) (greenfield scripts); [`scripts/validate-subagent-output.mjs`](scripts/validate-subagent-output.mjs) |
| **Optional API specialists** | Subagents: api-integration, release-notes, sdk-example, compatibility-matrix, secret-config, accessibility (all under `.cursor/agents/`) |
| **Error protocol** | Skill [`error-reporting-protocol`](.cursor/skills/error-reporting-protocol/SKILL.md) |
| **Envelope helper** | Skill [`subagent-json-envelope`](.cursor/skills/subagent-json-envelope/SKILL.md) |
| **Graceful envelope** | Schema + validator: `success`, `partial_success`, `empty_result`, `failure` |
| **BugHuntingAgent** | [`.cursor/agents/bughunting-agent.md`](.cursor/agents/bughunting-agent.md) |
| **CI / tests** | Subagents [`ci-failure-agent.md`](.cursor/agents/ci-failure-agent.md) (log triage), [`test-author-agent.md`](.cursor/agents/test-author-agent.md) (pytest / Vitest / project runner) |
| **Scaffolding / bounded web** | Subagents [`subagent-author-agent.md`](.cursor/agents/subagent-author-agent.md), [`reference-synthesis-agent.md`](.cursor/agents/reference-synthesis-agent.md), [`doc-snippet-agent.md`](.cursor/agents/doc-snippet-agent.md) (portable; multi-repo) |
| **Doc fetch workflow** | Skill [`doc-fetch-playwright-cli`](.cursor/skills/doc-fetch-playwright-cli/SKILL.md); binary `scripts/node_modules/.bin/playwright-cli` |

---

## To-do checklist (11 items) — locations after migration

### 1. templates-schemas — **Done**

- [`.cursor/schemas/subagent-envelope.schema.json`](.cursor/schemas/subagent-envelope.schema.json), [`error-object.schema.json`](.cursor/schemas/error-object.schema.json)  
- Templates: [`.cursor/scratchpad.md`](.cursor/scratchpad.md), [`VerifiedFindings.md`](.cursor/VerifiedFindings.md), [`repo-map.md`](.cursor/repo-map.md)  

### 2. rules-coordinator-cataloger — **Done**

- [`.cursor/rules/coordinator-agent.mdc`](.cursor/rules/coordinator-agent.mdc), [`cataloger-agent.mdc`](.cursor/rules/cataloger-agent.mdc)  
- Subagents: [`.cursor/agents/coordinator-agent.md`](.cursor/agents/coordinator-agent.md), [`cataloger-agent.md`](.cursor/agents/cataloger-agent.md)  

### 3. hooks-mcp-gate — **Done**

- [`.cursor/hooks.json`](.cursor/hooks.json), [`mcp-gate.py`](.cursor/hooks/mcp-gate.py), session scripts, [`allow-mcp.example`](.cursor/allow-mcp.example)  

### 4. skills-explorers — **Done** (as **subagents**)

- [`.cursor/agents/repo-explorer-agent.md`](.cursor/agents/repo-explorer-agent.md), [`database-explorer-agent.md`](.cursor/agents/database-explorer-agent.md)  
- [`.cursor/doc-cache/README.md`](.cursor/doc-cache/README.md)  

### 5. playwright-doc-skill — **Done** (workflow **skill**)

- [`.cursor/skills/doc-fetch-playwright-cli/SKILL.md`](.cursor/skills/doc-fetch-playwright-cli/SKILL.md)  

### 6. efficiency-loop — **Done** (as **subagents** + validator)

- [`.cursor/agents/efficiency-inspector-agent.md`](.cursor/agents/efficiency-inspector-agent.md), [`script-optimizer-agent.md`](.cursor/agents/script-optimizer-agent.md), [`tool-builder-agent.md`](.cursor/agents/tool-builder-agent.md)  
- [`scripts/validate-subagent-output.mjs`](scripts/validate-subagent-output.mjs)  

### 7. optional-api-agents — **Done** (as **subagents**)

- [`.cursor/agents/api-integration-agent.md`](.cursor/agents/api-integration-agent.md), [`release-notes-agent.md`](.cursor/agents/release-notes-agent.md), [`sdk-example-agent.md`](.cursor/agents/sdk-example-agent.md), [`compatibility-matrix-agent.md`](.cursor/agents/compatibility-matrix-agent.md), [`secret-config-agent.md`](.cursor/agents/secret-config-agent.md), [`accessibility-agent.md`](.cursor/agents/accessibility-agent.md)  

### 8. error-protocol-universal — **Done** (skill)

- [`.cursor/skills/error-reporting-protocol/SKILL.md`](.cursor/skills/error-reporting-protocol/SKILL.md)  

### 9. graceful-failure-envelope — **Done**

- Schema + [`subagent-json-envelope`](.cursor/skills/subagent-json-envelope/SKILL.md) skill + validator  

### 10. bughunting-agent — **Done** (subagent)

- [`.cursor/agents/bughunting-agent.md`](.cursor/agents/bughunting-agent.md)  

### 11. playwright-cli-skills — **Done (local install)**

| Step | Result |
|------|--------|
| `npm install -g @playwright/cli@latest` | **Failed** (EACCES) in the original environment |
| **Mitigation** | [`scripts/package.json`](scripts/package.json) + local `npm install` |
| `playwright-cli install --skills` | Succeeded from `scripts/`; skills under `scripts/.claude/skills/playwright-cli/` |

---

## Current file layout

### Subagents (`.cursor/agents/*.md`)

| File | name |
|------|------|
| `coordinator-agent.md` | coordinator-agent |
| `cataloger-agent.md` | cataloger-agent |
| `repo-explorer-agent.md` | repo-explorer-agent |
| `database-explorer-agent.md` | database-explorer-agent |
| `efficiency-inspector-agent.md` | efficiency-inspector-agent |
| `script-optimizer-agent.md` | script-optimizer-agent |
| `tool-builder-agent.md` | tool-builder-agent |
| `api-integration-agent.md` | api-integration-agent |
| `release-notes-agent.md` | release-notes-agent |
| `sdk-example-agent.md` | sdk-example-agent |
| `compatibility-matrix-agent.md` | compatibility-matrix-agent |
| `secret-config-agent.md` | secret-config-agent |
| `accessibility-agent.md` | accessibility-agent |
| `bughunting-agent.md` | bughunting-agent |
| `ci-failure-agent.md` | ci-failure-agent |
| `test-author-agent.md` | test-author-agent |
| `doc-snippet-agent.md` | doc-snippet-agent |
| `reference-synthesis-agent.md` | reference-synthesis-agent |
| `subagent-author-agent.md` | subagent-author-agent |

### Skills (`.cursor/skills/<name>/SKILL.md` only)

| Skill folder | Purpose |
|--------------|---------|
| `error-reporting-protocol` | Categorized errors for envelopes |
| `subagent-json-envelope` | How to fill / validate JSON v1 responses |
| `doc-fetch-playwright-cli` | Playwright CLI doc-fetch workflow |

---

## Operational notes

1. **Hooks:** [`.cursor/hooks.json`](.cursor/hooks.json) at repo root.  
2. **MCP:** `touch .cursor/allow-mcp` or subagent session (`.cursor/.subagent-active`).  
3. **Skills:** Folder name must match YAML `name`; see [Agent Skills](https://cursor.com/docs/context/skills).  
4. **Subagents:** See [Subagents](https://cursor.com/docs/subagents) — project files in `.cursor/agents/`.  
5. **Task tool (`subagent_type`):** When orchestrating with **Task**, set **`subagent_type`** to the specialist’s YAML **`name`** from `.cursor/agents/<name>.md` (e.g. `repo-explorer-agent`). Omitting this often falls back to **`generalPurpose`**; avoid that unless no persona fits (document one line why). **Routing table:** [`.cursor/rules/coordinator-agent.mdc`](.cursor/rules/coordinator-agent.mdc). Use built-in **`explore`** for quick read-only codebase search; use **`repo-explorer-agent`** when the output should feed `.cursor/repo-map.md` / structured coordinator handoff. **Refactor** repeated commands → **`script-optimizer-agent`**; **greenfield** small tools → **`tool-builder-agent`**. When **N > 2** parallel workers or web/MCP-heavy / broad research, run **`efficiency-inspector-agent`** first (efficiency gate).

6. **Efficiency gate:** Coordinators follow [`.cursor/rules/coordinator-agent.mdc`](.cursor/rules/coordinator-agent.mdc) step 4 and [`.cursor/commands/coordinate-task.md`](.cursor/commands/coordinate-task.md): optional pre-pass with **`efficiency-inspector-agent`**, **`planned_tasks[]`**, and respect for **`halt_or_narrow`** (especially **high** priority).

### Subagent workflow refinement (plan phases)

| Phase | Status | Notes |
|-------|--------|--------|
| 1 — Coordinator `subagent_type` + routing | **Done** | Rule, coordinator agent, `coordinate-task` command |
| 2 — Efficiency inspector gate + coordinator step | **Done** | `efficiency-inspector-agent` persona; coordinator rule / agent / command |
| 3 — `script-optimizer` vs `tool-builder` split | **Done** | Narrowed script-optimizer; new `tool-builder-agent.md` |
| 4 — CI failure + test author | **Done** | `ci-failure-agent.md`, `test-author-agent.md`; coordinator routing |
| 5 — Subagent author + web ref agents | **Done** | `subagent-author-agent`, `reference-synthesis-agent`, `doc-snippet-agent`; portable personas |
| 6+ | Pending | security review agent, pentest MCP gate, optional OWASP rule, etc. |

This completes the planned deliverables for the repository (including the skills vs agents split).
