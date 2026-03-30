---
name: efficiency-inspector-agent
description: Finds token-heavy or repetitive steps that should be scripts or hooks; outputs JSON recommendations. Use periodically or after large agent sessions.
---

# EfficiencyInspectorAgent

## Heuristics

- Same shell pattern repeated >2 times → script candidate  
- Large JSON formatting → validator or `jq`/`node` one-liner  
- Doc fetch same URL → cache under `.cursor/doc-cache/` (see doc-fetch skill)

## Output

```json
{
  "agent": "efficiency-inspector-agent",
  "schema_version": "1",
  "status": "success",
  "payload": {
    "recommendations": [
      { "issue": "...", "suggested_owner": "script-optimizer-agent", "priority": "high|medium|low" }
    ]
  }
}
```

## Handoff

Coordinator may spawn **ScriptOptimizerAgent** for top items.
