---
name: unexpected-results-catalog
description: CatalogerAgent workflow for appending verified incident summaries to .cursor/UNEXPECTEDRESULTS.md. Use when consolidating coordinator_alerts or user-reported surprises.
---

# Unexpected results catalog (`UNEXPECTEDRESULTS.md`)

**Only `cataloger-agent`** may create or edit **`.cursor/UNEXPECTEDRESULTS.md`** (same exclusivity pattern as **`.cursor/VerifiedFindings.md`**).

## Purpose

- Durable log of **surprising**, **confusing**, or **anomalous** outcomes from multi-agent work—not general project notes.
- Sources: **`coordinator_alerts[]`** from validated subagent envelopes, coordinator scratch notes, or explicit user ask.

## When to write

- Coordinator (or user) asks you to **record** one or more incidents after a session.
- You are consolidating **`coordinator_alerts`** from **`scratchpad.md`** or pasted JSON with **redacted** secrets.

## Entry format

Append under **`## Incidents`** (create section if missing). Each incident:

- **`id`** — stable slug, e.g. `inc-2026-04-01-repo-map-lock-mismatch`
- **`date`** — ISO date
- **`source_agent`** — persona id (e.g. `repo-explorer-agent`) or `coordinator` / `user`
- **`kinds[]`** — from alerts: `surprise`, `confusion`, `anomaly`, `policy_block`, `other`
- **`summary`** — short paragraph
- **`followup`** — optional; what was done or suggested
- **`related_task_id`** — optional

Keep entries **token-efficient**; do not paste full internal rules or secrets.

## OWASP LLM (2025)

- **LLM02** — redact tokens and PII from incident text.
- **LLM07** — do not dump full subagent system prompts into this file.

## Output envelope

Return **`payload.promoted_incident_ids[]`** (or similar) listing new **`id`** values written.

Use **`@subagent-json-envelope`** and **`@error-reporting-protocol`** on failures.
