#!/usr/bin/env python3
"""subagentStop: clear subagent session marker."""
import json
import os
import sys
from pathlib import Path


def main() -> None:
    try:
        json.load(sys.stdin)
    except json.JSONDecodeError:
        pass

    root = Path(os.environ.get("PWD", os.getcwd())).resolve()
    flag = root / ".cursor" / ".subagent-active"
    if flag.is_file():
        flag.unlink()

    print(json.dumps({}))


if __name__ == "__main__":
    main()
