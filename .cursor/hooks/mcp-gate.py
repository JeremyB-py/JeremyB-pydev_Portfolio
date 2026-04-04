#!/usr/bin/env python3
"""beforeMCPExecution: gate MCP by consent, subagent session, and high-risk tool policy."""
import json
import os
import sys
from pathlib import Path

# Substrings matched case-insensitively against tool_name for extra restriction.
# Keep specific to avoid false positives (avoid generic words like "binary").
PENTEST_TOOL_SUBSTRINGS_DEFAULT: tuple[str, ...] = (
    "ghidra",
    "ida64",
    "ida_pro",
    "hex-rays",
    "radare",
    "pwntools",
    "metasploit",
    "burp_suite",
    "pentest",
    "disassembl",
    "reverse_eng",
    "binary_ninja",
)


def project_root() -> Path:
    return Path(os.environ.get("PWD", os.getcwd())).resolve()


def load_extra_pentest_substrings(root: Path) -> tuple[str, ...]:
    path = root / ".cursor" / "pentest-mcp-tools.txt"
    if not path.is_file():
        return ()
    out: list[str] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            out.append(line.lower())
    return tuple(out)


def is_pentest_tool(tool: str, root: Path) -> bool:
    t = (tool or "").lower()
    for s in PENTEST_TOOL_SUBSTRINGS_DEFAULT + load_extra_pentest_substrings(root):
        if s in t:
            return True
    return False


def deny(tool: str, user_message: str, agent_message: str) -> None:
    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": user_message,
                "agent_message": agent_message,
            }
        )
    )


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        deny(
            "MCP",
            "MCP gate: invalid hook input",
            "Hook input was not valid JSON; MCP blocked.",
        )
        sys.exit(0)

    root = project_root()
    tool = str(data.get("tool_name") or "MCP")

    allow_mcp = root / ".cursor" / "allow-mcp"
    allow_pentest = root / ".cursor" / "allow-pentest-mcp"
    subagent = root / ".cursor" / ".subagent-active"

    if is_pentest_tool(tool, root):
        if allow_pentest.is_file() and subagent.is_file():
            print(json.dumps({"permission": "allow"}))
            return
        deny(
            tool,
            f"High-risk MCP blocked ({tool}). Create `.cursor/allow-pentest-mcp` and run inside a Task subagent session, or avoid this tool.",
            "High-risk MCP requires `.cursor/allow-pentest-mcp` plus `.cursor/.subagent-active`. See `.cursor/rules/pentest-mcp.mdc`.",
        )
        return

    if allow_mcp.is_file() or subagent.is_file():
        print(json.dumps({"permission": "allow"}))
        return

    deny(
        tool,
        f"MCP blocked ({tool}). Create `.cursor/allow-mcp` (empty file) to consent, or run work inside a Task subagent session.",
        "MCP is blocked until the user creates `.cursor/allow-mcp` or the session is a subagent (`.cursor/.subagent-active`). Ask the user to consent or delegate to a subagent.",
    )


if __name__ == "__main__":
    main()
