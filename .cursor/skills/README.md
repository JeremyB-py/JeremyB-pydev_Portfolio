# Agent skills (workflows)

This directory holds **skills**: portable workflow instructions in `your-skill-name/SKILL.md` (see [Agent Skills](https://cursor.com/docs/context/skills)). Use `/skill-name` or `@skill-name` to invoke.

**Subagent personas** (coordinator, cataloger, explorers, etc.) are defined in [`.cursor/agents/`](../agents/README.md), not under `skills/`.

| Skill | Purpose |
|-------|---------|
| [`owasp-llm-2025-baseline`](owasp-llm-2025-baseline/SKILL.md) | OWASP Top 10 for LLM Applications (2025) mitigations—referenced by subagents |
