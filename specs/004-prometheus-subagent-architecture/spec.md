# Feature Specification: Prometheus Subagent Orchestration Architecture

**Feature Branch**: `004-prometheus-subagent-architecture`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "apenas o prometheus pode ser um agent primary, os demais agents devem ser subagents e serão spawnados pelo prometheus quando necessário"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prometheus Spawns Subagent for Task (Priority: P1)

A user or system initiates a complex workflow that requires specialized agent capabilities beyond Prometheus's direct capabilities. Prometheus evaluates the request, identifies the needed subagent type, spawns an appropriate subagent instance, assigns the specific task, and receives the results upon completion.

**Why this priority**: This is the core operational pattern - enabling Prometheus to extend its capabilities through dynamic subagent spawning. Without this, the multi-agent hierarchy cannot function.

**Independent Test**: Can be fully tested by simulating a task request that requires a subagent, verifying that Prometheus spawns exactly one subagent of the correct type, assigns the task, and receives the result.

**Acceptance Scenarios**:

1. **Given** a workflow task requiring specialized capability X, **When** the task is submitted to Prometheus, **Then** Prometheus spawns exactly one subagent capable of handling capability X within the defined timeout window

2. **Given** a spawned subagent has completed its assigned task, **When** the subagent reports results to Prometheus, **Then** Prometheus receives the results and can proceed with the next workflow step

3. **Given** a subagent is no longer needed, **When** Prometheus determines the subagent's task is complete, **Then** the subagent is terminated or returns to idle state

---

### User Story 2 - Subagent Operates Under Prometheus Control (Priority: P1)

A spawned subagent performs its assigned work exclusively under Prometheus orchestration. The subagent cannot initiate new primary agents, cannot spawn other subagents as primaries, and must report back to Prometheus upon task completion or failure.

**Why this priority**: This ensures the architectural constraint that only Prometheus operates as primary agent is enforced at runtime. Without this, rogue primary agents could emerge.

**Independent Test**: Can be fully tested by attempting to have a subagent spawn another primary agent, verifying the operation is blocked and Prometheus is notified.

**Acceptance Scenarios**:

1. **Given** a spawned subagent attempting to spawn a new primary agent, **When** the subagent initiates the spawn request, **Then** the request is denied and Prometheus is notified of the violation

2. **Given** a subagent attempting to spawn another subagent as a primary, **When** the subagent initiates the spawn request, **Then** the request is denied and Prometheus is notified

---

### User Story 3 - Prometheus Coordinates Multiple Subagents (Priority: P2)

A complex workflow requires multiple specialized subagents working in parallel or sequence. Prometheus spawns the appropriate subagents, coordinates their activities, aggregates results, and manages dependencies between subagent tasks.

**Why this priority**: Enables scalable parallel processing where multiple subagents work simultaneously on different aspects of a complex task, improving overall throughput.

**Independent Test**: Can be fully tested by submitting a workflow that requires 3 subagents working in parallel, verifying all 3 are spawned, complete their tasks, and Prometheus aggregates their results correctly.

**Acceptance Scenarios**:

1. **Given** a workflow requiring N subagents in parallel, **When** Prometheus receives the workflow request, **Then** Prometheus spawns exactly N subagents within the spawn window and coordinates their parallel execution

2. **Given** multiple subagents completing tasks with dependencies, **When** a downstream subagent depends on an upstream result, **Then** Prometheus ensures proper sequencing and data passing between subagents

---

### Edge Cases

- **Subagent failure or crash**: Prometheus receives error notification, can retry the subagent with exponential backoff, or escalate to user if max retries exceeded
- **Unknown subagent type requested**: Prometheus returns error indicating unknown subagent type, suggests available subagent types
- **Prometheus becomes unavailable**: Subagents maintain last known state, execution environment handles cleanup, workflow marked as interrupted for user review
- **High-load spawn requests**: Prometheus queues spawn requests, processes within capacity limits, returns queue position to user

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Only Prometheus instances operating as primary agents can spawn subagents
- **FR-002**: All non-Prometheus agents MUST operate exclusively as subagents when spawned within the system
- **FR-003**: Subagent spawn requests MUST be initiated and controlled exclusively by Prometheus primary agents
- **FR-004**: Subagents MUST NOT be capable of spawning new primary agents - any such attempts MUST be denied
- **FR-005**: Subagents MUST report task completion or failure back to the Prometheus instance that spawned them
- **FR-006**: Prometheus MUST maintain orchestration control over spawned subagents throughout the subagent lifecycle
- **FR-007**: Subagent spawning MUST be traceable to the Prometheus primary agent that initiated it

### Key Entities

- **Prometheus (Primary Agent)**: The orchestrator agent that evaluates tasks, determines subagent requirements, spawns appropriate subagents, and coordinates overall workflow execution. Operates as the sole source of subagent spawn authority.
- **Subagent**: A specialized agent spawned by Prometheus to perform specific tasks. Operates under Prometheus control, cannot spawn primary agents, and reports results back to the spawning Prometheus instance.
- **Spawn Request**: A directive from Prometheus to create a new subagent instance with specific capabilities and task assignment.
- **Orchestration Session**: A container for a Prometheus-driven workflow that may involve multiple subagent spawns and coordinate their activities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of subagent spawn operations are initiated by Prometheus primary agents (zero rogue primary agent spawns)
- **SC-002**: All subagent spawn requests are traceable to the Prometheus instance that initiated them
- **SC-003**: Subagents attempting to spawn primary agents are blocked 100% of the time, with Prometheus notification
- **SC-004**: Prometheus can successfully coordinate at least 5 concurrent subagents in a single orchestration session
- **SC-005**: All spawned subagents complete their lifecycle (spawn → task execution → result reporting → termination/idle) within the defined timeout window

## Assumptions

- This architectural constraint applies to the oh-my-openspec workflow system's agent hierarchy
- Prometheus operates as the central orchestration point for all multi-agent workflows in the system
- **Multi-Prometheus scope**: For v1, a single Prometheus instance handles all orchestration. Each Prometheus instance operates independently with its own subagent pool. Cross-Prometheus subagent sharing is out of scope.
- Subagent capabilities are predefined and registered - dynamic subagent type creation is outside scope for v1
- Subagent identity and credentials are managed by the spawning Prometheus instance
- The system supports subagent communication back to Prometheus via established channels
- Subagent resource limits (memory, CPU, execution time) are enforced by the underlying execution environment
