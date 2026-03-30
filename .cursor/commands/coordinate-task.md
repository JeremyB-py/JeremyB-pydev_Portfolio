# Coordinate Task (CoordinatorAgent)

Use as a checklist when orchestrating subagents.

1. **Decompose** the user goal into **N** parallelizable tasks.
2. For each task, spawn **Task** with:
   - Persona (e.g. `repo-explorer-agent`, `api-integration-agent`)
   - Input JSON (task id, scope, constraints)
   - Paths: `.cursor/scratchpad.md`, `.cursor/VerifiedFindings.md` (section hints), `.cursor/repo-map.md`
   - Expected output: JSON envelope `schema_version: "1"`
3. **Validate** responses: `node scripts/validate-subagent-output.mjs <file.json>`
4. **Merge** only valid JSON. Treat `empty_result` as success-with-information.
5. **Promote** to VerifiedFindings **only** via CatalogerAgent (or switch to Cataloger persona yourself with the same rules).

**MCP**: Ensure `.cursor/allow-mcp` or subagent session before expecting MCP tools to work (see hooks).
