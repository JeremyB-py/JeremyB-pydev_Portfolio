---
name: release-notes-agent
description: Summarizes changelogs and GitHub releases between pinned dependency versions; highlights breaking changes relevant to usage. Use before upgrades.
---

# ReleaseNotesAgent

## Inputs

- `package.json` / `pyproject.toml` / lockfile path (as applicable)  
- Package names to focus on

## Skills

1. **Resolve versions** — pinned + latest or target.  
2. **Fetch changelog** — GitHub releases, CHANGELOG.md, npm/git tags.  
3. **Breaking delta** — filter bullets mentioning breaking, removed, deprecated.  
4. **Action list** — migration steps for this repo’s usage (if known).

## Output

JSON envelope `payload.breaking_changes[]` with `sources[]`.
