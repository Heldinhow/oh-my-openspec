# Implementation Plan: Prometheus Subagent Orchestration Architecture

**Branch**: `004-prometheus-subagent-architecture` | **Date**: 2026-04-12 | **Spec**: `specs/004-prometheus-subagent-architecture/spec.md`
**Input**: Feature specification from `specs/004-prometheus-subagent-architecture/spec.md`

## Summary

Enforce architectural constraint that only Prometheus operates as primary agent, with all other agents (Momus, Metis, Librarian, Oracle, etc.) functioning exclusively as subagents. Prometheus spawns subagents dynamically when specialized capabilities are needed, maintains orchestration control throughout subagent lifecycle, and receives violation notifications when spawn constraint violations occur.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 LTS) for plugin runtime + PowerShell 7.x for workflow scripts  
**Primary Dependencies**: `@opencode-ai/plugin`, existing agent system, Speckit command templates  
**Storage**: File-based artifacts in `specs/` plus YAML/JSON/Markdown configuration files  
**Testing**: Unit tests for authorization checks, integration tests for spawn flows, contract tests for violation notifications  
**Target Platform**: OpenCode CLI environments on macOS, Linux, Windows  
**Project Type**: Agent orchestration hierarchy enforcement (workflow plugin)  
**Performance Goals**: Subagent spawn authorization check in under 100ms; support 5+ concurrent subagents per session  
**Constraints**: Only Prometheus can be primary agent; subagents cannot spawn primary agents; all spawns must be traceable  
**Scale/Scope**: Single Prometheus instance for v1; independent subagent pools per Prometheus

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

- **I. Autonomous Operation**: PASS - Subagent spawning extends Prometheus capabilities without human intervention.
- **II. Production-Quality Code**: PASS - Authorization enforcement ensures reliable constraint satisfaction.
- **III. Test-First Discipline**: PASS - Tests validate constraint enforcement before implementation.
- **IV. Observability & Debuggability**: PASS - SpawnViolation records and Prometheus notification enable audit trail.
- **V. Simplicity & YAGNI**: PASS - Single Prometheus constraint is explicit scope; multi-Prometheus deferred to v2.
- **Architecture Constraints**: PASS - Authorization checks at spawn point maintain modular boundaries.

### Post-Phase 1 Re-Check

- **Gate Result**: PASS
- **Notes**: Phase 1 artifacts (`research.md`, `data-model.md`, `quickstart.md`) maintain clear separation between orchestration control (Prometheus) and execution (Subagents).

## Project Structure

### Documentation (this feature)

```text
specs/004-prometheus-subagent-architecture/
├── plan.md              # This file
├── spec.md              # Validated specification
├── research.md          # Phase 0: Architectural decisions
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Usage and validation
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (repository root)

```text
.src/
├── agents/
│   ├── types.ts                 # AgentType enum (primary|subagent)
│   ├── agent.interface.ts      # Base agent interface
│   └── registry.ts              # SubagentRegistry

.src/orchestration/
├── spawn-authorizer.ts         # Primary-only spawn authorization
├── orchestration-session.ts     # Session lifecycle management
├── spawn-request.ts            # Spawn request handling
└── violation-tracker.ts        # SpawnViolation records

.specify/
├── extensions/
│   └── prometheus-filter/       # Existing filter hook
└── agents/
    └── prometheus/             # Prometheus primary agent
```

**Structure Decision**: This is an architectural enforcement layer. Implementation extends existing agent system with authorization checks and lifecycle tracking. No separate service/application required.

## Complexity Tracking

No constitution violations require justification for this plan.
