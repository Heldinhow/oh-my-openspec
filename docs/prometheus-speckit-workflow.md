# Prometheus Speckit Orchestration Workflow

## Overview

This plugin combines OMO-style subagent orchestration with Speckit planning flow to provide a seamless experience from natural conversation to implementation.

## Architecture

### Agents

| Agent | Role | Description |
|-------|------|-------------|
| Prometheus | Orchestrator | Primary user-facing agent. Routes intent, manages stages, injects templates. |
| Momus | Spec Reviewer | Reviews specifications for completeness and gaps. |
| Metis | Researcher | Researches technical decisions and best practices. |
| Librarian | Context Manager | Manages specification context and artifact retrieval. |
| Oracle | Validator | Validates constraints and transition guards. |

### Stage Flow

```
specify → clarify → plan → tasks → handoff → build
```

- **specify**: Initial spec creation and review
- **clarify**: Resolving ambiguity and gaps
- **plan**: Technical planning and design
- **tasks**: Task breakdown
- **handoff**: Pre-implementation validation
- **build**: Implementation execution (separate from plan mode)

## Configuration

### Agent Models

Configure per-agent model assignments in `.config/opencode/agents.models.jsonc`:

```jsonc
{
  "agents": {
    "Prometheus": {
      "model_provider": "anthropic",
      "model_name": "claude-sonnet-4-20250514",
      "enabled": true
    },
    "Momus": {
      "model_provider": "anthropic",
      "model_name": "claude-sonnet-4-20250514",
      "enabled": true
    }
  }
}
```

## Usage

### Natural Conversation Flow

1. User sends a natural request to Prometheus
2. Prometheus classifies intent (feature/fix/refactor/other)
3. If planning required, automatically enters specify mode
4. Draft spec is created and delegated for review (via Momus)
5. Review feedback loops back to Prometheus for corrections
6. Once approved, **Prometheus advances naturally to planning** (no `/speckit.*` commands)
7. After tasks complete, automatic transition to build mode

**Critical: Prometheus never mentions `/speckit.*` commands**
- Prometheus IS the orchestrator — he executes the flow directly
- External commands are implementation details, not user-facing behavior
- Stage transitions happen naturally based on checkpoint status

### Stage Transitions

Prometheus manages stage transitions **automatically and naturally**:
- Intent classification results
- Review approval status (via Momus validation)
- Artifact completeness (spec.md, plan.md, tasks.md)
- User requests

**Transition Rules:**
| Current Stage | Condition | Next Stage |
|--------------|-----------|------------|
| specify | SPEC_VALIDATED + no clarifications needed | plan |
| specify | SPEC_VALIDATED + clarifications needed | clarify |
| clarify | All questions resolved | plan |
| plan | PLAN_VALIDATED + no gaps | tasks |
| tasks | TASKS_VALIDATED | handoff/build |

Prometheus evaluates checkpoint status and **advances without mentioning external commands**.

### Build Mode

Build mode activates after:
1. All planning artifacts exist (spec.md, plan.md, tasks.md)
2. User explicitly requests implementation
3. Handoff stage is reached

Prometheus does NOT generate implementation code in plan mode.

## Extension Hooks

Hooks are defined in `.specify/extensions.yml` and execute at lifecycle boundaries:
- `before_specify`, `after_specify`
- `before_plan`, `after_plan`
- `before_tasks`, `after_tasks`
- `before_implement`, `after_implement`
- And more...

## Command Templates

Templates live in `.opencode/command/`:
- `speckit.specify.md` — Spec creation
- `speckit.clarify.md` — Clarification
- `speckit.plan.md` — Planning
- `speckit.tasks.md` — Task breakdown
- `speckit.implement.md` — Implementation (build mode only)
