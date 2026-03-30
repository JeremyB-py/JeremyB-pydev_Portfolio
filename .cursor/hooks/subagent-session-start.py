#!/usr/bin/env python3
"""subagentStart: mark subagent session so beforeMCPExecution may allow MCP."""
import json
import os
import sys
from pathlib import Path


def main() -> None:
    try:
        json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permission": "deny", "user_message": "Invalid subagentStart payload"}))
        sys.exit(0)

    root = Path(os.environ.get("PWD", os.getcwd())).resolve()
    flag = root / ".cursor" / ".subagent-active"
    flag.parent.mkdir(parents=True, exist_ok=True)
    flag.touch()

    print(json.dumps({"permission": "allow"}))


if __name__ == "__main__":
    main()
