# Likely Cause — Dependency Health Dashboard

**Likely Cause** is a mobile-first dependency health dashboard for solo developers, freelancers, and small teams. It answers a practical question when something breaks:

> *Which part of the stack is probably failing, and what should I check right now?*

This is **not** primarily an uptime monitor. The differentiator is **lightweight incident triage**: combining your own health checks with official third-party status data to infer the likely failure layer with evidence and suggested next steps.

**Status:** v0.12.x — native home-screen widgets (Android + iOS scaffold), rule-based diagnosis engine, offline sync. Next: team accounts.

---

## Overview

At a high level, Likely Cause has four main parts:

**Mobile app (React Native + Expo)**  
Expo Router navigation, secure auth token storage, dashboard for monitor status, push notification registration, and native home-screen widgets (Overall, Project, Monitor Grid on Android; WidgetKit scaffold on iOS).

**API service (FastAPI)**  
REST API for auth, monitor CRUD, manual check triggers, check results/history, provider status, and diagnosis responses. Alembic migrations; Pydantic validation throughout.

**Background worker (Python)**  
Scheduled checks per monitor interval, state transitions (healthy / degraded / down / unknown), notification event queue, provider polling, and rule-based correlation for likely-cause labels.

**Shared packages & infra**  
Monorepo layout with Docker Compose for local Postgres + API + worker; `.env` templates for API and mobile dev builds.

---

## Architecture Highlights

### Monorepo Structure

- `apps/mobile/` → Expo app (Likely Cause)
- `services/api/` → FastAPI service
- `services/worker/` → Background worker
- `packages/shared/` → Shared packages (optional)
- `tests/` → Pytest suite
- `infra/` → Docker Compose for local dev

### Diagnosis Engine (North Star)

Example output the app targets:

```text
The Wrinkle Witch API is down.

Likely cause: Backend/database layer.

Evidence:
- Homepage is reachable.
- API /health returned 500.
- Database check failed inside the health response.
- Cloudflare, GitHub, and Square status are normal.

Suggested action:
Check backend logs and database connection settings.
```

Rules ship before AI — every label cites checks that support it.

### Check Types

Monitors support multiple check strategies:

- `http_status` — HTTP status code validation
- `response_time` — latency thresholds
- `keyword` — body content matching
- `json_path` — structured response field checks
- `health_endpoint` — structured `/health` contract parsing

URL discovery includes parallel path probing, sitemap mining, and rate-limit fallback with sequential retry.

---

## Key Features

| Category | Description |
|----------|-------------|
| `Monitors & Checks` | CRUD for URL and structured health-endpoint monitors; manual trigger; uptime % and last-failure summaries; retention policy for check results. |
| `Worker & Alerts` | Scheduled checks with per-monitor intervals and jitter; status-change detection; Expo push notifications with cooldowns; recovery alerts. |
| `Provider Status` | Pluggable adapters for third-party status feeds (AWS, Cloudflare, GitHub, Square, etc.); region/service linking for AWS dependencies. |
| `Diagnosis` | Rule-based correlation combining user checks + provider data; evidence-backed likely-cause labels and suggested actions (no AI in MVP). |
| `Mobile UX` | Dashboard, monitor detail, add-monitor flows with URL discovery; theme-aware Stellar palette; offline mode and local sync (Phase 10). |
| `Widgets` | Android home-screen widgets (Overall, Project Monitor, Monitor Grid) with tap-to-refresh, theme borders, and configurable monitor selection; iOS WidgetKit scaffold. |
| `Security` | JWT auth; PII encryption keys for sensitive fields; secure token storage on mobile. |

---

## Tech Stack

- **Mobile:** React Native · Expo · Expo Router · Expo Push Notifications
- **API:** FastAPI · Alembic · Pydantic · PostgreSQL
- **Worker:** Python (scheduled checks, push delivery, provider polling, diagnosis)
- **Widgets:** react-native-android-widget · @bacons/apple-targets (iOS)
- **Dev & Deploy:** Docker Compose · pnpm monorepo · pytest · Railway (planned)

---

## Highlights

- Mobile-first incident triage — not just red/green uptime dots.
- Monorepo with shared check runner code path for API manual checks and worker scheduled checks.
- Phases 0–10 complete: auth, monitors, worker, push, providers, diagnosis, widgets, offline sync.
- Real-world diagnosis example tied to the Wrinkle Witch API stack (dogfooding my own platform).
- Native widgets with theme-aware appearance and configurable monitor grids.

---

## Repository

The codebase is private. This page summarizes the architecture and shipped features.

Portfolio case study: [jeremyb.dev/projects/likely-cause/](https://jeremyb.dev/projects/likely-cause/)

---

## Skills Demonstrated

- Full-stack mobile + API design (Expo, FastAPI, PostgreSQL)
- Background job scheduling and status-transition detection
- Push notification pipeline (Expo Push / FCM)
- Pluggable provider adapter pattern for third-party status APIs
- Rule-based diagnosis engine with evidence citations
- Monorepo tooling (pnpm, Docker Compose, Alembic migrations)
- Native widget development (Android App Widget, iOS WidgetKit scaffold)
- pytest coverage for API, worker, and discovery resilience

---

## Next Steps

- Phase 11 — Team accounts and RBAC
- Railway production deployment
- Phase 12 — AI-assisted diagnosis (summarization layer on top of rules)

---
