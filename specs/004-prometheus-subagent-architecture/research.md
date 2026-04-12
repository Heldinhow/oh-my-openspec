# Research: Prometheus Subagent Orchestration Architecture

## Decision 1: Enforce primary-only spawn authority for Prometheus

- **Decision**: Only Prometheus instances operating as primary agents can initiate subagent spawn requests. All other agents must operate as subagents.
- **Rationale**: This maintains clear hierarchical control where Prometheus is the single source of orchestration authority. Without this constraint, any agent could spawn primary agents, leading to potential rogue orchestrators.
- **Alternatives considered**:
  - Any agent can spawn subagents: rejected because it loses centralized control and makes tracing/auditing complex.
  - Admin-only spawn authority: rejected because it conflicts with autonomous operation goal.

## Decision 2: Subagent spawn authorization check at runtime

- **Decision**: Enforce primary-only spawn constraint at runtime through authorization checks before subagent creation.
- **Rationale**: Runtime enforcement ensures the constraint cannot be bypassed through direct API calls or configuration changes. Static analysis alone is insufficient.
- **Alternatives considered**:
  - Configuration-only restriction: rejected because it can be bypassed and provides no audit trail.
  - Compile-time enforcement: rejected because it limits dynamic spawn scenarios.

## Decision 3: Block primary agent spawn attempts with Prometheus notification

- **Decision**: When a subagent attempts to spawn a primary agent, the request is denied and Prometheus is notified of the violation.
- **Rationale**: This ensures Prometheus can audit and respond to constraint violations, maintaining observability of the orchestration hierarchy.
- **Alternatives considered**:
  - Silent denial: rejected because it provides no audit trail for security review.
  - Termination of offending subagent: rejected because premature termination could disrupt valid workflows.

## Decision 4: Single Prometheus instance for v1

- **Decision**: For v1, a single Prometheus instance handles all orchestration. Each instance operates independently with its own subagent pool.
- **Rationale**: Simplifies initial implementation by avoiding distributed coordination complexity. Multi-Prometheus scenarios can be addressed in v2.
- **Alternatives considered**:
  - Multi-Prometheus from start: rejected due to added complexity of cross-Prometheus coordination.
  - No Prometheus constraint: rejected because it violates the core requirement.

## Decision 5: Subagent capability registry

- **Decision**: Subagent capabilities are predefined and registered. Dynamic subagent type creation is out of scope for v1.
- **Rationale**: Known capabilities enable type validation and clear error messages when unknown types are requested. Dynamic discovery adds complexity.
- **Alternatives considered**:
  - Dynamic subagent discovery: rejected to keep v1 scope manageable.
  - Subagent type inheritance: rejected as premature abstraction.

## Decision 6: Orchestration session as coordination context

- **Decision**: Prometheus creates an Orchestration Session to track subagent lifecycle and coordinate multi-subagent workflows.
- **Rationale**: Explicit session context enables proper lifecycle management, dependency tracking, and result aggregation for complex workflows.
- **Alternatives considered**:
  - Ad-hoc subagent tracking: rejected because it provides no structure for multi-subagent coordination.
  - Distributed session state: rejected due to complexity for v1 scope.

## Clarifications Resolved

All planning-stage unknowns have been addressed through the decisions above. Key resolutions:
- Edge cases now include resolution strategies (exponential backoff retry, error with suggestions, state maintenance, queuing)
- Multi-Prometheus scope clarified as single instance for v1 with independent operation
- No [NEEDS CLARIFICATION] items remain
