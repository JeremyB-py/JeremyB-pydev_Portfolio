# Capabilities inventory (attach on demand)

**Purpose:** Single place to see **skills**, **MCP**, and **subagent routing** without loading every name into every prompt. Coordinators: attach this file **only** for onboarding or large orchestration—see [`.cursor/agents/coordinator-agent.md`](agents/coordinator-agent.md) step 5.

This list is **maintained by hand** when `mcp.json` or personas change. Cursor does not expose a stable API to auto-export tool lists.

---

## Skills (workflows)

Canonical table: [`.cursor/skills/README.md`](skills/README.md). Invoke with `@skill-name` or `/skill-name`.

| When to attach | Skill |
|----------------|-------|
| Risk / LLM abuse patterns (two-tier: bullets vs full table) | `owasp-llm-2025-baseline` |
| Fill / validate subagent JSON envelope v1 | `subagent-json-envelope` |
| Categorized `errors[]` on failures | `error-reporting-protocol` |
| Surprise/confusion signals to coordinator | `unexpected-coordinator-alert` |
| Append incidents to `UNEXPECTEDRESULTS.md` (cataloger) | `unexpected-results-catalog` |
| JS-rendered docs via Playwright CLI | `doc-fetch-playwright-cli` |
| Large logs, JSON, lockfiles—**parse with code first** | `deterministic-parse-first` |

---

## MCP (Model Context Protocol)

| Item | Location |
|------|----------|
| **Active config** | [`.cursor/mcp.json`](mcp.json) (may be empty—no servers loaded). |
| **Examples** (e.g. Ghidra placeholder, **`disabled`: true**) | [`.cursor/mcp.json.example`](mcp.json.example) |
| **How-to + defer load** | [`.cursor/MCP.md`](MCP.md) |
| **Execution consent** | `.cursor/allow-mcp` or Task subagent session; hooks: [`.cursor/hooks/mcp-gate.py`](hooks/mcp-gate.py) |
| **High-risk / binary / pentest-class tools** | `.cursor/allow-pentest-mcp` + subagent session; [`.cursor/rules/pentest-mcp.mdc`](rules/pentest-mcp.mdc) |

Tool names are **not** listed here—they come from each server when enabled in Cursor **Settings → MCP**. Use **`disabled: true`** in JSON where supported so servers stay off until you toggle them on.

---

## Subagents (Task `subagent_type`)

**Single source of truth:** routing table in [`.cursor/rules/coordinator-agent.mdc`](rules/coordinator-agent.mdc) (intent → `name` → `.cursor/agents/<name>.md`).

---

## Efficiency: hooks and token use

| Mechanism | Role |
|-----------|------|
| [`.cursor/hooks/compress_tool_output.py`](hooks/compress_tool_output.py) | Trims oversized Task/MCP output (see hook config). |
| **`efficiency-inspector-agent`** | Pre-pass when many parallel workers or web/MCP-heavy work. |
| **`deterministic-parse-first`** | Prefer `jq`, small scripts, validators before LLM reasoning over huge raw text. |
| OWASP two-tier skill | Avoid loading full baseline unless high-risk or surprised. |

---

## Prompt caching (Cursor / providers)

**There is no project toggle** in `.cursor/` that enables provider “prompt caching” for chat. Caching behavior (where supported) is tied to **model and API**, not this repo.

**Practical equivalent:** keep prompts small—use skills selectively, attach **`capabilities-inventory.md`** only when needed, follow **`@deterministic-parse-first`**, and rely on hooks above.
