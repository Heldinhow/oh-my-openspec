# Data Model: Prometheus Subagent Orchestration Architecture

## Entity: Agent

- **Description**: Represents an agent in the orchestration hierarchy.
- **Fields**:
  - `agent_id` (string, required): Unique identifier for the agent.
  - `agent_name` (string, required): Human-readable name (e.g., "Prometheus", "Momus", "Metis").
  - `agent_type` (enum, required): `primary | subagent`.
  - `capabilities` (array, optional): List of capabilities this agent can handle.
  - `status` (enum, required): `active | idle | terminated`.
  - `parent_id` (string, optional): ID of the spawning Prometheus instance (null for primary agents).
  - `created_at` (datetime, required)
- **Validation Rules**:
  - `agent_type=primary` allows subagent spawn operations.
  - `agent_type=subagent` cannot initiate spawn requests for primary agents.
  - Only Prometheus can have `agent_type=primary`.
- **Relationships**:
  - One Prometheus can spawn many Subagent instances.

## Entity: OrchestrationSession

- **Description**: Container for a Prometheus-driven workflow that may involve multiple subagent spawns.
- **Fields**:
  - `session_id` (string, required): Unique workflow session identifier.
  - `prometheus_id` (string, required): ID of the Prometheus instance managing this session.
  - `current_stage` (enum, required): `specify | clarify | plan | tasks | build`.
  - `status` (enum, required): `active | interrupted | complete | failed`.
  - `spawned_agents` (array, optional): List of subagent IDs spawned within this session.
  - `started_at` (datetime, required)
  - `updated_at` (datetime, required)
- **Validation Rules**:
  - Only Prometheus instances can create OrchestrationSession.
  - Session tracks all spawned subagents for lifecycle management.
- **Relationships**:
  - One OrchestrationSession belongs to one Prometheus instance.
  - One OrchestrationSession contains many Agent (subagent) instances.

## Entity: SpawnRequest

- **Description**: A directive from Prometheus to create a new subagent instance.
- **Fields**:
  - `request_id` (string, required): Unique spawn request identifier.
  - `session_id` (string, required): Parent orchestration session.
  - `requestor_id` (string, required): ID of the agent initiating the spawn.
  - `target_type` (string, required): Type/capability of subagent to spawn.
  - `task_assignment` (object, optional): Task context and parameters.
  - `status` (enum, required): `pending | approved | denied | fulfilled | failed`.
  - `denial_reason` (string, optional): Reason if status is `denied`.
  - `created_at` (datetime, required)
- **Validation Rules**:
  - `requestor_id` must reference a primary agent (Prometheus).
  - Spawn requests from subagents are automatically denied.
- **Relationships**:
  - One SpawnRequest belongs to one OrchestrationSession.
  - One SpawnRequest results in one Agent (if approved).

## Entity: SpawnViolation

- **Description**: Record of a denied spawn attempt, particularly when subagents attempt primary agent spawns.
- **Fields**:
  - `violation_id` (string, required): Unique violation identifier.
  - `session_id` (string, required): Related orchestration session.
  - `violator_id` (string, required): ID of the agent that attempted the violation.
  - `violation_type` (enum, required): `subagent_spawn_primary | unauthorized_spawn`.
  - `details` (string, optional): Additional context about the violation.
  - `notified_prometheus_id` (string, required): Prometheus instance notified of violation.
  - `occurred_at` (datetime, required)
- **Validation Rules**:
  - Every denied primary-agent spawn attempt creates a SpawnViolation record.
- **Relationships**:
  - One SpawnViolation belongs to one OrchestrationSession.
  - One SpawnViolation notifies one Prometheus instance.

## Entity: SubagentRegistry

- **Description**: Registry of available subagent types and their capabilities.
- **Fields**:
  - `registry_id` (string, required): Unique registry identifier.
  - `subagent_types` (array, required): List of registered subagent type definitions.
  - `version` (string, required): Registry version for compatibility tracking.
  - `updated_at` (datetime, required)
- **SubagentType Definition**:
  - `type_id` (string): Unique type identifier.
  - `name` (string): Human-readable name.
  - `capabilities` (array): List of capabilities this type provides.
  - `version` (string): Type version.
- **Validation Rules**:
  - Registry is maintained by Prometheus on startup.
  - Unknown subagent types result in error responses.
- **Relationships**:
  - Referenced by SpawnRequest for type validation.
