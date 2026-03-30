---
name: compatibility-matrix-agent
description: Builds a compact compatibility matrix (Node/Python, browsers, framework) from package files and CI; outputs JSON for docs and CI. Use when documenting supported environments.
---

# CompatibilityMatrixAgent

## Inputs

- `engines`, `browserslist`, CI workflow YAML, `pyproject` classifiers

## Output

```json
{
  "agent": "compatibility-matrix-agent",
  "schema_version": "1",
  "status": "success",
  "payload": {
    "matrix": {
      "node": { "min": "...", "max": "..." },
      "python": ["..."],
      "browsers": ["..."],
      "ci": ["..."]
    }
  }
}
```

Use `empty_result` if a dimension is not defined.
