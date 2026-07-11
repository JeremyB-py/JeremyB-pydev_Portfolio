# ClipSpan — Universal Clipboard Sync

**ClipSpan** is a cross-platform clipboard history and sync system. The goal: copy or select content on Android and paste it on a Linux desktop (and vice versa), with searchable history across devices — without root access or unsafe permission workarounds.

**Status:** v0.8.x — QR pairing, offline-resilient history, ClipSpan Keyboard with toolbar send/paste. Android ↔ Ubuntu/Linux first; Windows and macOS planned.

---

## Overview

ClipSpan treats clipboard data as **sensitive by default** (passwords, tokens, addresses, code snippets). The first version establishes explicit, user-controlled sync before automatic behavior:

- Android **Send to Desktop** (selection action, share target, keyboard toolbar)
- Android **Paste from Desktop** (keyboard toolbar, history panel)
- Linux daemon **Send to Android** (tray action)
- Searchable cross-device history with clear delete controls

Long-term north star: frictionless install, pair, and daily paste — but privacy and user control come first.

---

## Architecture Highlights

### Modular Layers

```text
User interface layer
Clipboard access layer
Sync protocol layer
Transport layer
Storage/history layer
Pairing/security layer
Platform adapter layer
```

Each layer is decoupled so the Android keyboard, companion app, Linux daemon, and future Windows/macOS clients can evolve independently.

### Android (Gradle Multi-Module)

- `sync-core/` — HTTP clients, protocol, Room history, sync coordinator
- `sync-ime-bridge/` — fork-agnostic IME toolbar (push/pull/history, password guard)
- `companion-app/` — settings UI, share targets, history, Connect screen with QR scan
- `keyboard/` — **ClipSpan Keyboard** (FlorisBoard fork) with ClipSpan toolbar and embedded history grid

### Linux Daemon (FastAPI)

- Receives authenticated clipboard pushes; writes to system clipboard via Wayland (`wl-copy`) or X11 (`xclip`)
- SQLite local history; QR pairing API with per-peer sync tokens and device roster
- Pairing QR uses minimal token URL (`/p?t=…`); mDNS discovery optional

### Phase 7.5 — Offline-Resilient History

- Merge-only history sync: local Room cache never wiped when desktop is unreachable
- Offline paste fallback from last-pulled hash or most recent saved history
- `recordLocalCapture()` while companion or keyboard is active
- Pending push flush on reconnect via `ConnectionHealthWorker`

---

## Key Features

| Category | Description |
|----------|-------------|
| `Cross-Device Sync` | Authenticated push/pull over LAN; bearer-token per paired device; cleartext HTTP acceptable for LAN MVP only. |
| `QR Pairing` | CameraX + ML Kit scan from companion app; manual IP/token fallback; desktop `/pair` confirm page. |
| `ClipSpan Keyboard` | FlorisBoard-based IME with Send Clip, Paste, and 3-column scrollable history below toolbar; connection indicator (desktop monitor icon). |
| `Companion App` | Connect screen, history list, share targets, desktop settings provider; ClipSpan Nebula Material3 theme. |
| `Linux Daemon` | FastAPI endpoints for health, status, pair session, push/pull, history; config at `~/.config/clipspan/daemon.json`. |
| `History Model` | Room DB with `syncStatus` (`local_only` \| `synced`); display order `created_at DESC`; password-field guard on sync. |
| `Dev Workflow` | `./scripts/install-android-debug.sh` — one-command debug build + adb install for companion + keyboard. |

---

## Tech Stack

- **Android:** Kotlin · Gradle · Room · CameraX · ML Kit · FlorisBoard fork · Rust (native keyboard lib)
- **Linux:** Python 3.12+ · FastAPI · SQLite · wl-clipboard / xclip
- **Protocol:** JSON message schemas (`pair_bootstrap`, `pair_request`, `device_credential.v1`, sync payloads)
- **Tooling:** pytest · ADR-documented phases · `./scripts/run-linux-daemon.sh`

---

## Highlights

- User-visible control first — manual send/paste validates protocol before automatic sync.
- Modular architecture ready for Windows service and future macOS client.
- FlorisBoard keyboard integration with dual-clipboard policy (ClipSpan history vs Floris local panel).
- QR pairing + mDNS discovery reduce setup friction on the same LAN.
- Offline-resilient history: copies on Android while disconnected still appear locally and sync when reconnected.

---

## Repository

The codebase is private. This page summarizes the architecture and shipped features.

Portfolio case study: [jeremyb.dev/projects/clipspan/](https://jeremyb.dev/projects/clipspan/)

---

## Skills Demonstrated

- Cross-platform system design (Android IME + Linux daemon + shared protocol)
- Android multi-module Gradle project with composite keyboard build (Kotlin + Rust NDK)
- FastAPI service design with pairing security and device roster management
- Offline-first sync semantics (merge-only reconcile, pending push flush)
- FlorisBoard fork maintenance and IME toolbar integration
- ADR-driven phased delivery (Phases 0–7.5 documented)
- Wayland/X11 clipboard integration on Linux

---

## Next Steps

- Windows desktop client/service
- Optional ClipSpan account for credential sync across devices
- Automatic sync mode (user opt-in) after manual flow is proven reliable
- macOS client (Phase 3)

---
