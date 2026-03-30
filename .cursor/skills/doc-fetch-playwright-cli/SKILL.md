---
name: doc-fetch-playwright-cli
description: Workflow to fetch JS-rendered or hard-to-scrape documentation using Playwright CLI under scripts/ (token-efficient vs MCP). Use when static HTTP fetch fails or pages need a real browser.
---

# Doc fetch (Playwright CLI)

## Install (this repo)

Dependencies live under `scripts/`:

```bash
cd scripts && npm install
./node_modules/.bin/playwright-cli --help
```

Upstream skills (from `playwright-cli install --skills`) are at:

`scripts/.claude/skills/playwright-cli/SKILL.md`

Read that file for command grammar (`snapshot`, `goto`, `eval`, etc.).

## Workflow

1. Prefer **cache**: check `.cursor/doc-cache/` for URL + date.  
2. Run `playwright-cli` from `scripts/` so the local binary resolves.  
3. Capture **snapshot** or **eval** output; normalize to JSON for the coordinator.  
4. Save raw extract under `.cursor/doc-cache/` with metadata header (`url`, `fetched_at`).  
5. Respect robots.txt and rate limits.

## Output

JSON envelope with `payload.extract` (structured fields), `sources[]`, and `status: success` or `empty_result` if nothing found (not an error).

## MCP

Prefer CLI over MCP for this repo; MCP is gated by `.cursor/hooks/mcp-gate.py` unless consented or subagent session.
