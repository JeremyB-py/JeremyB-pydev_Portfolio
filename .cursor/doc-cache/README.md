# Documentation cache

Store cached fetches here to avoid repeat Playwright/browser cost.

- Suggested filename pattern: `slug-from-url--sha1prefix.json` or `.md` for markdown snapshots.
- Include **url**, **fetched_at**, and optional **etag** inside the file header or sidecar.
- Git: large binaries should stay local; add patterns to `.gitignore` if needed.

See skill: [doc-fetch-playwright-cli](../skills/doc-fetch-playwright-cli/SKILL.md) and upstream Playwright CLI skills under `scripts/.claude/skills/playwright-cli/`.
