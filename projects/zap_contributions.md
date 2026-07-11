# Zap — Open Source Contributions

Contributions to **[Zap](https://github.com/zerx-lab/zap)** — an open, local-first terminal with first-class AI and agent support (Rust, forked from Warp). Zap emphasizes privacy defaults: no mandatory cloud, bring-your-own-provider (BYOP) AI keys, and third-party CLI agents wired into Blocks.

These three merged pull requests (July 2026) focus on making **BYOP Agent Mode** reliable on Linux with local and third-party AI providers.

---

## Overview

Zap's BYOP path lets users plug in any OpenAI-compatible endpoint plus native OpenAI, Anthropic, Gemini, DeepSeek, and Ollama protocols. Agent Mode sends tools to the model and executes shell commands when the model requests them.

Before these fixes, local models (Ollama `llama3.1`, etc.) often returned tool-shaped JSON in assistant text instead of native `tool_calls` stream events — Zap displayed the JSON but did not execute commands. Provider routing also sent gpt-5.x models to the wrong API endpoint, and Linux Settings lacked paste support for configuring API keys.

---

## Merged Pull Requests

| PR | Issue | Title | Impact |
|----|-------|-------|--------|
| [#305](https://github.com/zerx-lab/zap/pull/305) | [#300](https://github.com/zerx-lab/zap/issues/300) | BYOP Agent Tool Execution Fix | Parse tool-shaped JSON from assistant text when native `tool_calls` missing; execute shell tools; preserve structured tool history for multi-turn follow-ups |
| [#306](https://github.com/zerx-lab/zap/pull/306) | [#302](https://github.com/zerx-lab/zap/issues/302) | BYOP Provider Routing Fix | Auto-route OpenAI gpt-5.x to Responses API; normalize Anthropic/Ollama base URLs; fix 404 on `/v1/api/chat` |
| [#307](https://github.com/zerx-lab/zap/pull/307) | [#303](https://github.com/zerx-lab/zap/issues/303) | Linux Settings Paste Fix | Ctrl+V paste and context-menu Cut/Copy/Paste in Settings text fields |

---

## PR #305 — BYOP Agent Tool Execution

**Problem:** Local BYOP providers respond to agent prompts but often do not emit native `message.tool_calls` stream events. Models emit tool-shaped JSON in assistant `content` instead — displayed but not executed. Multi-turn follow-ups could not use prior command output.

**Changes:**

- New `content_tool_calls.rs`: parse tool-shaped JSON from assistant text when native stream events are absent
- Wire extraction into `generate_byop_output` after stream end when `tool_bufs` is empty
- Remap common local-model mistakes to `run_shell_command`
- Ollama outbound history: skip tool-shaped JSON blobs only when structured `ToolCall` messages already exist
- New `local.j2` system prompt template (~500B vs ~9k default) for Ollama via `pick_template`
- Unit tests for Qwen/Llama/Gemma-style JSON-in-text patterns

**Stats:** +841 / −40 lines · 8 files · 5 commits

---

## PR #306 — BYOP Provider Routing

**Problem:** Agent Mode requests with tools failed with HTTP 400/404 on wrong endpoints — gpt-5.x hitting `/v1/chat/completions`, Ollama hitting `/v1/api/chat`, Anthropic double `/messages/messages`.

**Changes:**

- `effective_adapter_kind_for`: resolve genai adapter from `api_type`, model id, and `base_url`
- Auto-upgrade `OpenAi` + gpt-5* / codex / pro → `OpenAIResp` for `/v1/responses`
- `normalize_endpoint_url`: strip trailing `/messages` on Anthropic; strip erroneous `/v1/` on Ollama
- Fix Ollama default `base_url` from `http://localhost:11434/v1/` to `http://localhost:11434/`
- Unit tests in `adapter_routing_tests`

**Stats:** +285 / −20 lines · 3 files · stacked on #305

---

## PR #307 — Linux Settings Paste

**Problem:** Settings view text editor on Linux did not support Ctrl+V paste or context-menu Cut/Copy/Paste — difficult to configure BYOP API keys and base URLs.

**Changes:**

- Ctrl+V paste keybinding on Linux in `app/src/editor/view/mod.rs`
- Cut, Copy, Paste context menu in `app/src/settings_view/mod.rs` (dynamic based on selection/editability)

**Stats:** +149 / −12 lines · 2 files

---

## Tech Stack

- **Language:** Rust (95% of Zap codebase)
- **Area touched:** `app/src/ai/agent_providers/` (chat stream, content tool extraction, prompt renderer, adapter routing), settings editor UI
- **Testing:** `cargo test -p warp content_tool_calls`, `adapter_routing_tests`, `./script/presubmit`; manual Ollama + OpenAI BYOP validation on Linux

---

## Highlights

- End-to-end BYOP Agent Mode fix across three stacked PRs merged in one release cycle.
- Stream parsing and multi-turn tool history retention for local models that don't speak native tool_calls.
- Provider adapter routing hardening for OpenAI Responses API, Anthropic Messages API, and Ollama native API.
- Practical Linux UX fix unblocking API key configuration.

---

## Repository

Public: [github.com/zerx-lab/zap](https://github.com/zerx-lab/zap)

Portfolio case study: [jeremyb.dev/projects/zap-contributions/](https://jeremyb.dev/projects/zap-contributions/)

---

## Skills Demonstrated

- Rust debugging in a large production codebase (AI agent providers, stream handling)
- BYOP / local LLM integration patterns (JSON-in-text tool extraction vs native tool_calls)
- Multi-provider API routing (OpenAI Responses, Anthropic Messages, Ollama)
- Unit and smoke test authoring in Rust
- Open-source contribution workflow (issue-linked PRs, changelog entries, presubmit)

---
