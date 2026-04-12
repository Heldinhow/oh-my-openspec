# Data Model: Prometheus Speckit Orchestration Plugin

## Entity: IntentClassification

- **Description**: Structured intent extracted from a user message to determine workflow routing.
- **Fields**:
  - `intent_id` (string, required): Unique identifier for the classification event.
  - `raw_input` (string, required): Original user message.
  - `intent_type` (enum, required): `feature | fix | refactor | other`.
  - `planning_required` (boolean, required): Whether specify flow must start.
  - `confidence` (number, required): Confidence score from 0.0 to 1.0.
  - `created_at` (datetime, required): Classification timestamp.
- **Validation Rules**:
  - `intent_type` must be one of the supported categories.
  - `planning_required=true` must trigger stage entry into specify mode.
- **Relationships**:
  - One `IntentClassification` starts one `WorkflowSession`.

## Entity: WorkflowSession

- **Description**: End-to-end orchestration lifecycle for one user request.
- **Fields**:
  - `session_id` (string, required): Unique workflow id.
  - `active_agent` (enum, required): `Prometheus | Momus | Metis | Librarian | Oracle`.
  - `current_mode` (enum, required): `plan | build`.
  - `current_stage` (enum, required): `specify | clarify | plan | tasks | handoff | build`.
  - `feature_directory` (string, required): Speckit feature path.
  - `status` (enum, required): `active | blocked | complete`.
  - `started_at` (datetime, required)
  - `updated_at` (datetime, required)
- **Validation Rules**:
  - `current_mode=plan` forbids implementation code emission by Prometheus.
  - `current_mode=build` is allowed only after `tasks.md` completion and explicit user implementation request.
- **State Transitions**:
  - `active(plan/specify)` -> `active(plan/clarify)` when gaps are detected.
  - `active(plan/tasks)` -> `active(plan/handoff)` when tasks are completed.
  - `active(plan/handoff)` -> `active(build/build)` on implementation request.

## Entity: AgentProfile

- **Description**: Allowed agent definition and model assignment used by orchestrator.
- **Fields**:
  - `agent_name` (enum, required): `Prometheus | Momus | Metis | Librarian | Oracle`.
  - `role` (string, required): Functional role in workflow.
  - `model_provider` (string, required): Model vendor identifier.
  - `model_name` (string, required): Selected model for the agent.
  - `enabled` (boolean, required): Whether the agent is active.
- **Validation Rules**:
  - Only five allowed agents may exist.
  - Every enabled agent must have a valid model assignment.
- **Relationships**:
  - One `WorkflowSession` references multiple `AgentProfile` entries.

## Entity: SpecReviewResult

- **Description**: Result payload from delegated spec review.
- **Fields**:
  - `review_id` (string, required)
  - `session_id` (string, required)
  - `review_agent` (enum, required): One of allowed agents.
  - `approved` (boolean, required)
  - `gaps` (array, required): List of identified issues.
  - `recommendations` (array, optional): Suggested corrections.
  - `reviewed_at` (datetime, required)
- **Validation Rules**:
  - `approved=false` requires at least one item in `gaps`.
  - Workflow cannot move to final planning completion while unresolved gaps exist.
- **Relationships**:
  - One `WorkflowSession` can have many `SpecReviewResult` entries.

## Entity: PlanningArtifactSet

- **Description**: Required planning files created in Speckit structure.
- **Fields**:
  - `feature_directory` (string, required)
  - `spec_file` (string, required)
  - `plan_file` (string, required)
  - `tasks_file` (string, required)
  - `additional_files` (array, optional): e.g., research, data-model, quickstart, contracts.
  - `artifact_status` (enum, required): `in_progress | complete`.
- **Validation Rules**:
  - `artifact_status=complete` requires spec, plan, and tasks files to exist.
  - Paths must be under Speckit-standard feature directory.
- **Relationships**:
  - One `WorkflowSession` owns one `PlanningArtifactSet`.
