# Feature Specification: Speckit Artifact Validation Orchestration

**Feature Branch**: `002-speckit-artifact-validation`
**Created**: 2026-04-12
**Status**: Draft
**Input**: User description: "precisamos garantir que o plugin implementa o fluxo do speckit + orquestracao de multi agents como o oh-my-openagent faz. /Users/helder/Projetos/oh-my-openagent . ou seja, ele garante que haja uma validação em cada artefato de spec, tasks e plan. A ideia também é que o fluxo do speckit seja algo natural, onde o user nao precise enviar comandos /speckit., ou seja, o proprio agent faz isso automaticamente. no pior dos cenários o agent pergunta o que fazer. Acho que seria interessante o plugin ter arquivos de templates para serem usados. spec, tasks e plan. igual o speckit faz, ele disponibiliza arquivos de modelo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Intent-Driven Speckit Flow (Priority: P1)

As a user interacting with Prometheus, I want to describe my intent naturally in plain language and have the orchestrator automatically navigate through the complete Speckit workflow (specify → clarify → plan → tasks → implement) without requiring me to manually invoke any `/speckit.` commands, so I can focus on providing requirements and feedback rather than managing workflow mechanics.

**Why this priority**: This is the foundational capability that makes the orchestration feel natural rather than mechanical. If users must remember and invoke commands, the experience degrades to manual operation rather than intelligent assistance.

**Independent Test**: Can be fully tested by providing natural language intent and verifying all workflow transitions occur automatically without any `/speckit.` command invocation by the user.

**Acceptance Scenarios**:

1. **Given** the user sends a natural language request to Prometheus describing a feature, fix, or refactor, **When** the intent requires planning, **Then** the orchestrator automatically transitions to specify mode and begins `spec.md` creation without any `/speckit.specify` command from the user.
2. **Given** the user is mid-workflow and the orchestrator detects ambiguity or missing information, **When** clarification is needed, **Then** the orchestrator automatically invokes `speckit.clarify` and presents natural language questions to the user rather than demanding command invocation.
3. **Given** the user is mid-workflow and the orchestrator detects that plan generation is next, **When** spec validation passes, **Then** the orchestrator automatically transitions to plan mode and begins `plan.md` creation without any `/speckit.plan` command from the user.
4. **Given** the user is mid-workflow and the orchestrator detects that task generation is next, **When** plan validation passes, **Then** the orchestrator automatically transitions to tasks mode and begins `tasks.md` creation without any `/speckit.tasks` command from the user.
5. **Given** all validations pass and the user requests implementation, **When** the orchestrator receives an implementation request, **Then** the orchestrator automatically transitions to build mode and begins execution without any `/speckit.implement` command from the user.
6. **Given** the workflow requires user input or confirmation at any stage, **When** the orchestrator needs guidance, **Then** it asks natural questions in plain language and waits for user response before proceeding automatically.

---

### User Story 2 - Spec-Level Validation with Momus (Priority: P2)

As a product owner or quality assurance reviewer, I want every specification artifact to be validated by Momus (spec reviewer agent) before the workflow advances to planning, so that missing scope, ambiguous requirements, and acceptance gaps are caught early and fixed before they propagate into downstream artifacts.

**Why this priority**: Validation at the specification level prevents rework and ensures all planning downstream starts from a solid foundation.

**Independent Test**: Can be fully tested by submitting a spec with intentional gaps and verifying Momus flags them before `plan.md` generation is allowed to proceed.

**Acceptance Scenarios**:

1. **Given** a draft `spec.md` exists in the feature directory, **When** the workflow reaches the specification finalization stage, **Then** Momus is automatically invoked to review the spec and return structured feedback with identified gaps or explicit approval.
2. **Given** Momus identifies gaps in the spec, **When** Prometheus receives the review feedback, **Then** the draft spec is updated, and Momus re-reviews until approval is granted or a maximum retry limit is reached.
3. **Given** Momus approves the spec, **When** the workflow advances, **Then** a validation checkpoint is recorded in the feature state and `plan.md` generation is unlocked.

---

### User Story 3 - Plan-Level Validation with Metis (Priority: P3)

As a technical lead or architect, I want every implementation plan artifact to be validated by Metis (gap analyzer agent) before tasks are generated, so that hidden ambiguities, missing edge cases, and implicit assumptions are surfaced and documented in the plan itself.

**Why this priority**: Plans with hidden gaps lead to implementation delays and scope creep; Metis forces externalization of implicit knowledge before tasks are derived.

**Independent Test**: Can be tested by creating a plan with intentionally omitted edge cases and verifying Metis flags the gaps before `tasks.md` generation proceeds.

**Acceptance Scenarios**:

1. **Given** an approved `spec.md` and a draft `plan.md` exist, **When** the workflow reaches plan finalization stage, **Then** Metis is automatically invoked to analyze the plan for hidden assumptions, missing acceptance criteria, and edge case gaps.
2. **Given** Metis identifies gaps, **When** Prometheus receives the analysis, **Then** the plan is updated to address each identified gap and Metis re-analyzes before tasks are generated.
3. **Given** Metis validates the plan, **When** the workflow advances, **Then** a validation checkpoint is recorded and `tasks.md` generation is unlocked.

---

### User Story 4 - Tasks-Level Validation with Oracle (Priority: P4)

As a delivery lead, I want every tasks artifact to be validated by Oracle (architecture validator) before implementation begins, so that each task has clear scope, correct dependencies, and verifiable acceptance criteria that align with the approved plan.

**Why this priority**: Tasks without clear boundaries or verifiable criteria lead to implementation inconsistency and difficulty in measuring completion.

**Independent Test**: Can be tested by creating tasks with missing acceptance criteria or unclear scope and verifying Oracle flags these issues before implementation starts.

**Acceptance Scenarios**:

1. **Given** an approved `plan.md` and a draft `tasks.md` exist, **When** the workflow reaches task finalization stage, **Then** Oracle is automatically invoked to validate each task for scope clarity, dependency correctness, and verifiable acceptance criteria.
2. **Given** Oracle identifies task-level issues, **When** Prometheus receives the validation report, **Then** the affected tasks are updated before implementation is permitted.
3. **Given** Oracle approves the task set, **When** the workflow advances, **Then** a validation checkpoint is recorded and implementation mode is unlocked.

---

### User Story 5 - Validation State Tracking and Rollback (Priority: P5)

As a workflow controller, I want validation state to be tracked across all artifact stages so that the system can detect incomplete validations, enforce sequential progression, and allow rollback to previous stages when re-validation is required.

**Why this priority**: Without state tracking, the system cannot enforce that validation always precedes advancement or support recovery from failed validations.

**Independent Test**: Can be tested by attempting to advance to tasks stage without plan validation and verifying the system blocks the transition with a clear error.

**Acceptance Scenarios**:

1. **Given** a feature workflow is in progress, **When** any artifact stage is modified, **Then** the validation state for that artifact is reset and re-validation is required before advancement.
2. **Given** validation fails at any stage, **When** the user attempts to advance, **Then** the system blocks advancement and reports the specific validation failures.
3. **Given** validation passes at all required stages, **When** the user requests implementation, **Then** the system confirms all checkpoints are met and enables build mode.

---

### User Story 6 - Plugin Template Files (Priority: P6)

As a plugin developer, I want the plugin to ship with its own template files (spec, tasks, plan) that define the structure and placeholders for each artifact type, so that the orchestration workflow produces consistent, well-formed outputs following the Speckit conventions.

**Why this priority**: Templates ensure that every artifact generated by the plugin adheres to a known structure, making the workflow predictable and the outputs easier to validate programmatically.

**Independent Test**: Can be tested by generating artifacts through the plugin workflow and verifying each output file matches the corresponding template structure and placeholder definitions.

**Acceptance Scenarios**:

1. **Given** the plugin is installed, **When** a new feature workflow begins, **Then** the orchestrator uses the plugin's spec template (`spec-template.md`) as the starting point for `spec.md` creation.
2. **Given** the plugin is installed, **When** plan generation begins, **Then** the orchestrator uses the plugin's plan template as the starting point for `plan.md` creation.
3. **Given** the plugin is installed, **When** task generation begins, **Then** the orchestrator uses the plugin's tasks template as the starting point for `tasks.md` creation.
4. **Given** a template file is modified by the user, **When** the orchestrator generates a new artifact, **Then** the orchestrator uses the modified template, preserving user customizations.
5. **Given** the orchestrator needs to generate an artifact, **When** the corresponding template is missing or corrupted, **Then** the system reports an error with guidance on restoring the default template.

---

### Edge Cases

- User intent is ambiguous and could map to multiple workflow paths (quick fix vs. full specification).
- Validation agent (Momus, Metis, or Oracle) is unavailable or returns an error response.
- An artifact file is deleted or renamed during the workflow.
- The user manually edits an artifact after validation approval, invalidating the checkpoint.
- Validation finds issues that require scope changes rather than simple clarification.
- Maximum retry limit is reached without achieving approval.
- Multiple validation issues are found across different artifact stages simultaneously.
- User attempts to skip ahead to implementation before spec or plan is approved.
- User provides conflicting guidance during clarification (changes answer mid-questionnaire).
- Workflow reaches a stage that requires user confirmation but user is unresponsive.
- A template file is missing, corrupted, or contains invalid placeholder syntax.
- A template file has been customized by the user and the orchestrator must respect those customizations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The orchestrator MUST invoke Momus for spec validation after `spec.md` is drafted and before `plan.md` generation begins.
- **FR-002**: The orchestrator MUST invoke Metis for plan validation after `plan.md` is drafted and before `tasks.md` generation begins.
- **FR-003**: The orchestrator MUST invoke Oracle for tasks validation after `tasks.md` is drafted and before implementation mode begins.
- **FR-004**: Each validation agent MUST return structured feedback containing: approval status, identified gaps, and specific recommendations.
- **FR-005**: If validation returns gaps, the orchestrator MUST route feedback to Prometheus for correction and MUST re-validate the updated artifact before advancing.
- **FR-006**: The workflow MUST track validation state for each artifact (pending, in-review, approved, rejected) and persist this state.
- **FR-007**: The workflow MUST enforce sequential validation: spec approval REQUIRED before plan validation, plan approval REQUIRED before tasks validation.
- **FR-008**: If a validated artifact is modified after approval, the workflow MUST automatically invalidate the checkpoint and require re-validation.
- **FR-009**: The orchestrator MUST record validation checkpoints with timestamps in the feature state file.
- **FR-010**: If a validation agent is unavailable or returns an error, the orchestrator MUST report the failure and pause advancement until resolved.
- **FR-011**: Maximum retry limit for failed validations MUST be configurable (default: 3 attempts per artifact).
- **FR-012**: The validation loop MUST exit with explicit failure status if maximum retries are reached without approval.
- **FR-013**: User edits to artifacts during validation loop MUST trigger re-validation without consuming a retry increment.
- **FR-014**: The orchestrator MUST provide clear status messages indicating current validation stage, pending issues, and advancement readiness.
- **FR-015**: The orchestrator MUST automatically detect when user intent requires Speckit workflow and MUST initiate the appropriate stage (specify, plan, tasks, or implement) without any explicit `/speckit.` command from the user.
- **FR-016**: The orchestrator MUST automatically transition between Speckit stages in sequence after each artifact passes validation, without requiring user intervention.
- **FR-017**: When the orchestrator encounters ambiguity or missing information during any workflow stage, it MUST automatically invoke `speckit.clarify` and present natural language questions to the user, rather than blocking or demanding manual commands.
- **FR-018**: At any workflow stage that requires user input or confirmation, the orchestrator MUST request this input through natural conversational prompts, not through command syntax or technical directives.
- **FR-019**: The orchestrator MUST track the current workflow stage and validate that sequential progression rules are maintained: specify → clarify (if needed) → plan → tasks → implement.
- **FR-020**: If the user attempts to skip ahead or request an out-of-sequence action, the orchestrator MUST either automatically navigate through missing stages or clearly explain what must happen first in natural language.
- **FR-021**: The plugin MUST provide template files for all Speckit artifact types: spec, plan, and tasks.
- **FR-022**: Each template file MUST define the required sections, placeholders, and structural format for its corresponding artifact type.
- **FR-023**: The orchestrator MUST use the plugin's template files as the basis for generating new artifacts, ensuring consistency with Speckit conventions.
- **FR-024**: If a template file is missing or unreadable, the orchestrator MUST report an error and halt artifact generation until the template is restored or replaced.

### Key Entities *(include if feature involves data)*

- **Validation State**: Per-artifact record containing validation status, timestamps, retry count, and approving agent.
- **Validation Feedback**: Structured output from validation agents containing approval status, gap list, and recommendations.
- **Validation Checkpoint**: Confirmed approval record for an artifact that unlocks advancement to the next stage.
- **Validation Configuration**: Settings for retry limits, timeout values, and validation agent model assignments.
- **Feature State File**: Persistent file tracking all artifact validation states for a given feature workflow.
- **Artifact Template**: A file defining the structure, required sections, and placeholder content for a given artifact type (spec, plan, tasks).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of spec artifacts are validated by Momus before plan generation in all test scenarios.
- **SC-002**: 100% of plan artifacts are validated by Metis before tasks generation in all test scenarios.
- **SC-003**: 100% of tasks artifacts are validated by Oracle before implementation mode in all test scenarios.
- **SC-004**: Sequential validation enforcement achieves zero instances of advancement without required validation approval in all test runs.
- **SC-005**: Re-validation after artifact modification is triggered within 1 workflow response in all test scenarios.
- **SC-006**: Validation feedback is returned to Prometheus and incorporated into artifact updates before re-validation in 100% of gap scenarios.
- **SC-007**: Maximum retry limit is respected and explicit failure is reported when reached, in 100% of failing validation scenarios.
- **SC-008**: In acceptance testing, 100% of planning-required prompts are handled by automatic Speckit workflow initiation with zero `/speckit.` command invocations by the user.
- **SC-009**: In acceptance testing, 100% of clarification requests from the orchestrator are delivered as natural language questions with no command syntax or technical directives.
- **SC-010**: In acceptance testing, 100% of generated artifacts conform to their corresponding template structure with all required sections present.
- **SC-011**: Template files are loadable and parseable in all supported environments (Windows, macOS, Linux).

## Assumptions

- Speckit workflow stages (specify, plan, tasks, implement) are available and their sequence is fixed.
- Prometheus serves as the orchestrator and artifact corrector throughout the validation loop.
- Momus, Metis, and Oracle agents are available and configured with appropriate models for validation tasks.
- Validation agents are configured independently from execution agents to avoid resource contention.
- The feature state file format is compatible with the existing Speckit state tracking mechanism.
- Users have ability to configure retry limits and validation agent models via configuration file or command arguments.
- Template files are stored in a designated templates directory within the plugin structure and follow Markdown format with placeholder syntax.
