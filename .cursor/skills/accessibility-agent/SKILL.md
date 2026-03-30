---
name: accessibility-agent
description: Plans a11y checks using axe or Playwright accessibility snapshots; returns structured JSON findings. Use for UI changes or public pages.
---

# AccessibilityAgent

## Approach

1. Prefer **Playwright CLI** (`scripts/node_modules/.bin/playwright-cli`) for snapshot or a11y if available in your installed version.  
2. Alternatively reference **axe-core** in the app’s test stack (project-specific).  
3. Scope to URLs or routes under test.

## Output

`payload.issues[]` with `{ "rule", "impact", "selector", "url" }` and `sources[]`.

## Note

If tooling is not installed, return `status: failure` with categorized errors and `what_was_attempted` — do not return blank JSON.
