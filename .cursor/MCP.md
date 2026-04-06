# Project MCP configuration

## Files

| File | Purpose |
|------|---------|
| [`mcp.json`](mcp.json) | **Active** Cursor MCP config for this repo (committed). Starts empty—add servers as needed. |
| [`mcp.json.example`](mcp.json.example) | **Example** stanzas (e.g. Ghidra-oriented MCP). Copy/adapt into `mcp.json`; do **not** commit secrets. |

## Deferred loading

- Set **`"disabled": true`** on a server entry so Cursor does **not** load it until you **enable** it under **Settings → MCP** (wording may vary by Cursor version).
- Keeping **`mcpServers`** empty in [`mcp.json`](mcp.json) avoids loading any project MCP tools until you add entries.

## Ghidra / reverse-engineering MCP

There is **no** single blessed npm package wired in this repo. Community options include Python/PyPI **`ghidramcp`**, **LaurieWired/GhidraMCP**, **pyghidra-mcp**, etc. Each requires a **local Ghidra install**, compatible **Java**, and often a **plugin or bridge**—not something CI can verify here.

The example entry in [`mcp.json.example`](mcp.json.example) is a **placeholder**:

1. Install Ghidra and any MCP bridge per upstream docs.
2. Replace **`env`** paths with your machine’s absolute paths (or use shell env, not committed values).
3. Rename/copy the stanza into [`mcp.json`](mcp.json) and enable in the UI when needed.
4. **Policy:** High-risk/binary tools are gated by [`.cursor/hooks/mcp-gate.py`](hooks/mcp-gate.py) and [`.cursor/rules/pentest-mcp.mdc`](rules/pentest-mcp.mdc) (`.cursor/allow-pentest-mcp` + Task subagent session). Prefer **`app-security-review-agent`** for scoped review.

## Security

- Never commit API keys or tokens in `mcp.json`. Use environment variables or Cursor’s secret storage per vendor docs.
- After editing `mcp.json`, **restart Cursor** or reload MCP so changes apply.
