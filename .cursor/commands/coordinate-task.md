# Coordinate Task (CoordinatorAgent)

Use as a checklist when orchestrating subagents.

1. **Decompose** the user goal into **N** parallelizable tasks.
2. For each task, spawn **Task** with **`subagent_type` = YAML `name`** from the chosen [`.cursor/agents/`](../agents/) file (e.g. `repo-explorer-agent`, `api-integration-agent`). Persona files: `repo-explorer-agent.md`, etc. The **`name`** field in frontmatter is what the Task tool must receive; slash commands are optional UX. **Avoid** defaulting to **`generalPurpose`**—if you use it, add **one line** in the task prompt explaining why no specialist fit.
3. **Routing:** Full table in [`.cursor/rules/coordinator-agent.mdc`](../rules/coordinator-agent.mdc). Short map: repo map / conventions → `repo-explorer-agent`; quick codebase search → `explore`; DB → `database-explorer-agent`; API contracts → `api-integration-agent`; SDK samples → `sdk-example-agent`; changelogs → `release-notes-agent`; env matrix → `compatibility-matrix-agent`; secrets/CORS → `secret-config-agent`; a11y → `accessibility-agent`; diff vs contract → `bughunting-agent`; workflow efficiency review → `efficiency-inspector-agent`; refactor repetition into scripts → `script-optimizer-agent`; verified findings → `cataloger-agent`. Greenfield tools → `tool-builder-agent` once that agent exists (Phase 3).
4. Per task, include: input JSON (`task_id`, scope, constraints); paths `.cursor/scratchpad.md`, `.cursor/VerifiedFindings.md` (section hints), `.cursor/repo-map.md`; expected output JSON envelope `schema_version: "1"`.
5. **Validate** responses: `node scripts/validate-subagent-output.mjs <file.json>`
6. **Merge** only valid JSON. Treat `empty_result` as success-with-information.
7. **Promote** to VerifiedFindings **only** via CatalogerAgent (or switch to Cataloger persona yourself with the same rules).

**MCP**: Ensure `.cursor/allow-mcp` or subagent session before expecting MCP tools to work (see hooks).
