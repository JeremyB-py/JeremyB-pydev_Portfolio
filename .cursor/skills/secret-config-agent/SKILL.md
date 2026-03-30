---
name: secret-config-agent
description: Checks env templates, secret leakage patterns, and basic CORS/origin sanity for web apps; outputs JSON findings. Use during security review or before deploy.
---

# SecretConfigAgent

## Checks

1. `.env.example` presence vs code references; no real secrets in repo.  
2. Grep patterns for `api_key`, `secret`, `BEGIN PRIVATE KEY` in tracked files.  
3. **CORS** — `Access-Control-Allow-Origin: *` with credentials; wildcards on production.  
4. **Origins** — mismatch between frontend URL and API base.

## Output

`payload.findings[]` with `{ "severity", "category", "file", "detail" }` using [error-reporting-protocol](../error-reporting-protocol/SKILL.md) categories where applicable.
