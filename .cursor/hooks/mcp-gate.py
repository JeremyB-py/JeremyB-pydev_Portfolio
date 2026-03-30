#!/usr/bin/env python3
"""beforeMCPExecution: allow MCP only if user consented or a subagent session is active."""
import json
import os
import sys
from pathlib import Path


def project_root() -> Path:
    cwd = Path(os.environ.get("PWD", os.getcwd())).resolve()
    return cwd


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(
            json.dumps(
                {
                    "permission": "deny",
                    "user_message": "MCP gate: invalid hook input",
                    "agent_message": "Hook input was not valid JSON; MCP blocked.",
                }
            )
        )
        sys.exit(0)

    root = project_root()
    allow = root / ".cursor" / "allow-mcp"
    subagent = root / ".cursor" / ".subagent-active"

    if allow.is_file() or subagent.is_file():
        print(json.dumps({"permission": "allow"}))
        return

    tool = data.get("tool_name", "MCP")
    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": f"MCP blocked ({tool}). Create `.cursor/allow-mcp` (empty file) to consent, or run work inside a Task subagent session.",
                "agent_message": "MCP is blocked until the user creates `.cursor/allow-mcp` or the session is a subagent (`.cursor/.subagent-active`). Ask the user to consent or delegate to a subagent.",
            }
        )
    )


if __name__ == "__main__":
    main()
