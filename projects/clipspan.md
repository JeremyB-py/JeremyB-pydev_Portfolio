# ClipSpan : Universal Clipboard Sync

<img class="project-logo" src="../media/clipspan/logo-lockup.png" alt="ClipSpan logo" />

**ClipSpan** is a cross-platform clipboard history and sync system. The goal: copy or select content on Android and paste it on a Linux or Windows desktop (and vice versa), with searchable history across devices — without root access or unsafe permission workarounds.

**Status:** v0.16.0 — one Android APK (companion + ClipSpan Keyboard), Rust/Tauri desktop for Linux and Windows with first-run setup and signed auto-updates, docked history picker, multimedia sync, offline-resilient history, encrypted vault backup/restore, Hidden / Recently removed with durable purge, optional end-to-end encrypted account + relay. Approaching private/public testing. macOS planned.

> **Product site & testing:** [clipspan.com](https://clipspan.com/) — current product state and signup for private/public testing when builds open.

---

## Overview

ClipSpan treats clipboard data as **sensitive by default** (passwords, tokens, addresses, code snippets). Local-only LAN pairing remains the default. Explicit user-controlled send/paste validates the protocol first; opt-in automatic sync and optional account/relay paths layer on after that.

Daily flows:

- Android **Send Clip** (selection action, share target, keyboard toolbar)
- Android **Paste** from history / desktop (keyboard toolbar, companion history)
- Desktop tray **Send Clip**, hotkey history picker, paste-into-focused-app
- Searchable cross-device history with hide, recently removed, undo, and clear controls

Long-term north star: frictionless install, pair, and daily paste — but privacy and user control come first.

---

## Media

Desktop and Android histories staying in sync — the product story in one frame:

![ClipSpan desktop syncing with Android history](../media/clipspan/hero-sync.png)

Desktop history picker docked at the top of the screen (hotkey paste into the focused app):

![ClipSpan desktop with top-docked history picker](../media/clipspan/ubuntu-history-screenshot-top.png)

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

Each layer is decoupled so the Android keyboard, companion app, Linux/Windows desktop client, and future macOS client can evolve independently.

### Android (Gradle Multi-Module)

- Ships as **one APK** (`com.clipspan.app`): companion Connect/history/account UI is the launcher; **ClipSpan Keyboard** is included in the same package
- `sync-core/` : HTTP clients, protocol, Room history, sync coordinator, account client
- `sync-ime-bridge/` : fork-agnostic IME toolbar (push/pull/history, password guard)
- `companion-app/` : Connect/QR pairing, history, settings, Account screen, share targets, first-run setup, Report a bug
- `keyboard/` : FlorisBoard-based IME with toolbar + history grid (Floris clipboard history and addons store hidden)
- Shared history via `HistoryContentProvider` so companion and keyboard use one Room DB

### Desktop (Rust + Tauri 2 + Svelte)

- Shared Linux/Windows client: `clipspan-core` (axum HTTP hub, SQLite, QR pairing, mDNS), `clipspan-clipboard` adapters, Tauri tray UI
- Docked history picker (edge bar, opacity, hotkey toggle); paste selected item into the focused app
- First-run setup wizard (skippable); Linux clipboard/paste tool check with the distro install command
- Signed desktop auto-updater (GitHub releases); single-instance guard; Settings About; Report a bug / Copy diagnostics (no clipboard content or secrets)
- Native in-process X11/XWayland clipboard watching; Wayland falls back to `wl-paste` / watch; Windows clipboard adapters
- Headless `clipspan-daemon` still available for CI or no-GUI hosts (legacy Python FastAPI daemon superseded for daily use)

### Account + Relay (optional, self-hostable)

- Rust/Axum `account-api` + `relay` with PostgreSQL path; email/password MVP
- End-to-end credential vault and opaque relay mailbox/blobs (HPKE-sealed payloads; servers store ciphertext)
- Trusted-device sliding sessions, device rename/revoke/unrevoke, encrypted history vault backup/restore, soft-delete with delayed hard purge

### Offline-Resilient History

- Merge-only history sync: local Room / SQLite cache never wiped when peers are unreachable
- Offline paste fallback, local image capture, pending push flush on reconnect
- Per-device hide registry, recently removed retention, and vault plaintext that preserves hidden state across restore

---

## Key Features

| Category | Description |
|----------|-------------|
| `Cross-Device Sync` | Authenticated LAN push/pull; bearer-token per paired device; image/blob transfer with size/MIME policy. |
| `QR Pairing` | CameraX + ML Kit scan from companion; in-app Accept on desktop; manual IP/token fallback. |
| `History Picker` | Hotkey-summoned translucent docked bar; dock edge/opacity settings; paste into focused app (SSH/terminal-friendly). |
| `ClipSpan Keyboard` | FlorisBoard-based IME bundled in the Android APK; Send Clip, Paste, scrollable history, connection indicator; sync disabled in password fields. |
| `Companion App` | Same APK: Connect, history, Hidden / Recently removed, Account, share targets, first-run setup; ClipSpan Nebula Material3 theme. |
| `Desktop Client` | Tray app for Linux/Windows; first-run wizard; signed auto-updates; Status/Settings/Pairing/Account/Devices; Start at login; Wayland portal or GNOME shortcut setup. |
| `Optional Account` | E2E vault + relay for off-LAN delivery; trusted devices; unified device roster; recovery key; vault backup/restore with Append vs Replace. |
| `History UX` | Hide with undo, recently removed / durable purge, clear-all policy, offline catch-up, viewer-scoped hidden state across devices. |
| `Dev Workflow` | `./scripts/install-android-debug.sh`, `./scripts/build-desktop.sh`, `./scripts/run-server.sh` for local account-api/relay. |

---

## Tech Stack

- **Android:** Kotlin · Gradle · Room · CameraX · ML Kit · FlorisBoard fork · OkHttp · Rust (native keyboard lib)
- **Desktop:** Rust · Tauri 2 · Svelte · axum · SQLite · wl-clipboard / xclip / native X11 backend
- **Server (optional):** Rust · Axum · PostgreSQL · HPKE / Argon2id / ChaCha20-Poly1305 vault crypto
- **Protocol:** Versioned JSON schemas (`pair_bootstrap`, `device_credential.v1`, CLIPBOARD_PUSH / LATEST, vault plaintext v1–v3)
- **Tooling:** pytest · cargo test · ADR-documented phases · CHANGELOG-driven version sync

---

## Highlights

- User-visible control first: manual Send Clip / Paste validates the protocol before automatic sync.
- Local-first by default; account and relay are opt-in and end-to-end encrypted on the cloud path.
- One Android install: companion UI and ClipSpan Keyboard ship in a single APK.
- First-run wizards and signed desktop updates so a tester can install, pair, and stay current without a changelog tour.
- Docked desktop history picker and ClipSpan Keyboard keep history next to where you type or paste.
- Offline-resilient history and reconnect flush so copies made away from the hub still converge.

---

## Repository

The application codebase is private. Public marketing site: [clipspan.com](https://clipspan.com/) (signup for private/public testing).

Portfolio case study: [jeremyb.dev/projects/clipspan/](https://jeremyb.dev/projects/clipspan/)

---

## Skills Demonstrated

- Cross-platform system design (Android IME + Rust desktop + shared sync protocol)
- Android multi-module Gradle project with composite keyboard build (Kotlin + Rust NDK)
- Rust/Tauri desktop engineering (clipboard backends, Wayland shortcuts, docked overlay UX)
- Self-hostable account/relay services with E2E vault and device-bound sessions
- Offline-first sync semantics (merge-only reconcile, pending push flush, blob lifecycle)
- FlorisBoard fork maintenance and IME toolbar integration
- ADR-driven phased delivery through account sync, history UX, and frictionless first-run / updater packaging
- Privacy-first product defaults (local-only LAN, password-field guard, ciphertext-only relay)

---

## Next Steps

- Private, then public testing via the [clipspan.com](https://clipspan.com/) signup
- Store packaging (Windows Authenticode, Play listing / Android release signing)
- macOS client

---
