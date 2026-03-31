#!/usr/bin/env python3
"""
postToolUse: compress verbose tool outputs (Task subagents, MCP, noisy Shell JSON).

- MCP: set `updated_mcp_tool_output` (per Cursor docs).
- Task / Shell / Read / Write / Grep: set `updated_tool_output` (string) — supported on many builds; if ignored, check Cursor version / Hooks channel.
"""
from __future__ import annotations

import json
import re
import sys
from typing import Any

MAX_CHARS = 8000
TAIL_KEEP = 1500

_FILLER_LINE = re.compile(
    r"^(?:Let me|I'll|I will|First,|Step \d+[:.)]|\s*Thinking[,:]|\s*Here(?:'s| is) (?:a |the )?(?:quick |detailed )?(?:summary|overview|analysis))\s*$",
    re.IGNORECASE,
)


def _truncate(s: str) -> str:
    if len(s) <= MAX_CHARS:
        return s
    head = max(500, MAX_CHARS - TAIL_KEEP - 120)
    return (
        s[:head]
        + "\n\n[…compressed: omitted "
        + str(len(s) - head - TAIL_KEEP)
        + " chars…]\n\n"
        + s[-TAIL_KEEP:]
    )


def _compress_text(s: str) -> str:
    if len(s) <= MAX_CHARS:
        return s
    lines = [ln for ln in s.splitlines() if not _FILLER_LINE.match(ln.strip() or "")]
    merged = "\n".join(lines)
    return _truncate(merged)


def _walk(obj: Any) -> Any:
    if isinstance(obj, str):
        return _compress_text(obj)
    if isinstance(obj, list):
        return [_walk(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _walk(v) for k, v in obj.items()}
    return obj


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("{}")
        return

    # afterMCPExecution: same compression if the client honors replacement (audit in Hooks channel).
    if "result_json" in data and data.get("tool_output") is None:
        rj = data.get("result_json")
        if not isinstance(rj, str):
            print("{}")
            return
        try:
            parsed = json.loads(rj)
        except json.JSONDecodeError:
            new_str = _compress_text(rj)
        else:
            new_str = json.dumps(_walk(parsed), ensure_ascii=False)
        if new_str == rj:
            print("{}")
            return
        try:
            out = {"updated_mcp_tool_output": json.loads(new_str)}
        except json.JSONDecodeError:
            out = {"updated_mcp_tool_output": {"_compressed_text": new_str}}
        print(json.dumps(out))
        return

    tool_name = str(data.get("tool_name") or "")
    raw = data.get("tool_output")
    if raw is None:
        print("{}")
        return

    original_str = raw if isinstance(raw, str) else json.dumps(raw, ensure_ascii=False)

    try:
        parsed = json.loads(original_str)
    except json.JSONDecodeError:
        new_str = _compress_text(original_str)
    else:
        new_str = json.dumps(_walk(parsed), ensure_ascii=False)

    if new_str == original_str:
        print("{}")
        return

    out: dict[str, Any] = {}

    if "MCP" in tool_name:
        try:
            out["updated_mcp_tool_output"] = json.loads(new_str)
        except json.JSONDecodeError:
            out["updated_mcp_tool_output"] = {"_compressed_text": new_str}

    if tool_name == "Task" or tool_name in (
        "Shell",
        "Read",
        "Write",
        "Grep",
        "Delete",
    ):
        out["updated_tool_output"] = new_str

    print(json.dumps(out))


if __name__ == "__main__":
    main()
