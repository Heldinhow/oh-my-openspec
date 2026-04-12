# Research: Prometheus Speckit Orchestration Plugin

## Decision 1: Keep Prometheus as the only user-facing orchestrator

- **Decision**: Prometheus remains the single conversational entrypoint and delegates specialized work to subagents.
- **Rationale**: This preserves natural conversation while maintaining deterministic orchestration control in one place.
- **Alternatives considered**:
  - Multiple user-facing agents with direct interaction: rejected because it increases routing ambiguity.
  - Manual slash-command-only flow: rejected because it conflicts with natural interaction goals.

## Decision 2: Use explicit intent classification categories for routing

- **Decision**: Route incoming prompts into at least feature/fix/refactor/other categories, then evaluate whether planning is required.
- **Rationale**: This enables consistent transition rules into specify mode while preserving lightweight handling for simple requests.
- **Alternatives considered**:
  - Binary classify (plan vs no-plan): rejected because it loses useful context for downstream behavior.
  - Free-form interpretation without category labels: rejected due to inconsistent stage transitions.

## Decision 3: Stage-aware command template injection

- **Decision**: Inject Speckit templates based on workflow stage, with `speckit.specify` at planning entry and `speckit.clarify` allowed at any stage.
- **Rationale**: This keeps the flow natural to users while still guaranteeing the structured lifecycle expected by Speckit.
- **Alternatives considered**:
  - Execute all templates in fixed order regardless of context: rejected because it creates unnecessary steps.
  - Never inject and rely only on agent free-form reasoning: rejected because it weakens reproducibility.

## Decision 4: Add mandatory delegated spec review before plan completion

- **Decision**: Every draft spec is reviewed by a delegated subagent; gaps must be resolved by Prometheus before proceeding.
- **Rationale**: This enforces spec quality and reduces downstream planning rework.
- **Alternatives considered**:
  - Optional manual review: rejected because quality would depend on user intervention.
  - Prometheus self-review only: rejected because independent review improves gap detection.

## Decision 5: Per-agent model configuration remains externalized

- **Decision**: Keep model selection in agent configuration mapping, compatible with OMO-style behavior.
- **Rationale**: Provider changes (Claude/GPT/etc.) can be made without altering workflow logic.
- **Alternatives considered**:
  - Hard-coded models per agent: rejected due to poor operability and experimentation limits.
  - Global single-model setting: rejected because specialized agents may require different model profiles.

## Decision 6: Restrict active agent set to five named agents

- **Decision**: Only Prometheus, Momus, Metis, Librarian, and Oracle are available in this plugin scope.
- **Rationale**: Constraining scope simplifies orchestration policy and reduces operational noise.
- **Alternatives considered**:
  - Keep all legacy agents: rejected because it conflicts with requested scope.
  - Dynamic discovery of all available agents: rejected for v1 to keep behavior predictable.

## Decision 7: Replace constitution guidance with AGENTS guidance in orchestration flow

- **Decision**: The orchestration workflow should resolve guidance from `agents.md` as primary context source.
- **Rationale**: This aligns plugin behavior with the requested governance source while maintaining compatibility with Speckit lifecycle.
- **Alternatives considered**:
  - Keep constitution as primary guidance: rejected because it conflicts with explicit requirement.
  - Merge both files without precedence: rejected because conflict resolution becomes ambiguous.

## Decision 8: Enforce automatic build handoff after tasks completion

- **Decision**: When `tasks.md` is complete and user requests implementation, workflow automatically switches to build mode.
- **Rationale**: This preserves a seamless planning-to-execution handoff and respects Prometheus plan-only role.
- **Alternatives considered**:
  - Require manual mode switch command: rejected because it adds avoidable friction.
  - Allow Prometheus to implement directly: rejected because it violates role boundaries.

## Clarifications Resolved

All planning-stage unknowns were resolved through the decisions above; no open `NEEDS CLARIFICATION` items remain.
