# Feature Specification: Prometheus Speckit Orchestration Plugin

**Feature Branch**: `001-prometheus-speckit-plugin`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Criar plugin para OpenCode combinando infra do oh-my-openagent (OMO) com fluxo Speckit, mantendo Prometheus como orquestrador e subagents configuraveis por modelo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Intent-to-Spec Flow (Priority: P1)

As a product user interacting with Prometheus, I want to describe a request naturally (feature, fix, refactor, etc.) and have the workflow automatically enter specification mode when planning is needed, so I can move from idea to structured spec without manual command orchestration.

**Why this priority**: This is the entry point of the entire experience; if intent detection and specify transition fail, the rest of the workflow is blocked.

**Independent Test**: Can be fully tested by submitting planning-worthy prompts and verifying the system classifies intent and produces a draft specification workflow without requiring manual command selection.

**Acceptance Scenarios**:

1. **Given** the user sends a natural-language feature request to Prometheus, **When** intent is classified as planning-required, **Then** the workflow enters specify mode and starts a specification draft.
2. **Given** the user sends a small change request that does not require planning, **When** Prometheus evaluates intent, **Then** the system keeps the request out of specify mode and explains the selected path.

---

### User Story 2 - Spec Review Loop with Subagent Models (Priority: P2)

As a workflow owner, I want a subagent to review every drafted specification for gaps and return findings to Prometheus, so that missing scope, ambiguity, and acceptance gaps are resolved before planning artifacts are finalized.

**Why this priority**: Quality control before planning prevents incomplete requirements from propagating into plan and task artifacts.

**Independent Test**: Can be tested by generating an intentionally incomplete draft spec and confirming a review subagent flags gaps, sends feedback to Prometheus, and triggers a corrected draft cycle.

**Acceptance Scenarios**:

1. **Given** a draft spec exists, **When** review is delegated to a configured subagent model, **Then** review feedback is returned with explicit gaps or approval.
2. **Given** review feedback identifies missing requirements, **When** Prometheus receives feedback, **Then** it updates the draft and resubmits it for review before moving forward.

---

### User Story 3 - Complete Planning Artifacts and Build Handoff (Priority: P3)

As a delivery lead, I want the plugin to generate all Speckit planning artifacts in the standard directory structure and automatically hand off to build mode after tasks are complete and implementation is requested, so the planning-to-execution transition is seamless.

**Why this priority**: The workflow only delivers value when planning outputs are complete and can transition cleanly into execution.

**Independent Test**: Can be tested by completing specify/plan/tasks flow and asking to implement; the system must produce expected artifacts and switch modes without Prometheus writing implementation code in plan mode.

**Acceptance Scenarios**:

1. **Given** planning flow is active, **When** plan generation completes, **Then** spec, plan, and task artifacts are present in Speckit-standard paths.
2. **Given** tasks are finalized and the user asks to implement, **When** Prometheus receives that request, **Then** the workflow switches to build mode automatically and starts execution orchestration.

---

### Edge Cases

- User intent is ambiguous between quick fix and full specification flow.
- Review subagent model configured for an unavailable provider.
- Review repeatedly finds unresolved gaps across multiple cycles.
- User asks for implementation before `tasks.md` is complete.
- Existing constitution guidance is still present while workflow must use `agents.md`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST classify user intent from natural conversation into at least: feature, fix, refactor, and other actionable categories.
- **FR-002**: The system MUST enter specify mode automatically when intent indicates planning and execution are required.
- **FR-003**: The orchestrator MUST inject and apply `speckit.specify` workflow templates once specify mode starts.
- **FR-004**: After draft spec creation, the orchestrator MUST delegate spec review to a subagent before planning continues.
- **FR-005**: The review subagent model MUST be selectable through the same agent-model configuration mechanism used for other orchestrated agents.
- **FR-006**: If review finds specification gaps, the system MUST route feedback to Prometheus, require spec updates, and re-run review prior to advancing.
- **FR-007**: The planning flow MUST generate `spec.md`, `plan.md`, `tasks.md`, and any other Speckit planning-stage artifacts required by the selected flow stage.
- **FR-008**: All generated artifacts MUST follow the existing Speckit directory structure conventions.
- **FR-009**: The workflow MUST automatically replace constitution usage with `agents.md` as the governing guidance source.
- **FR-010**: The plugin MUST preserve OMO-style orchestration behavior, including model-per-agent configuration.
- **FR-011**: The orchestrated agent set MUST include only: Prometheus, Momus, Metis, Librarian, and Oracle.
- **FR-012**: The orchestrator MUST be able to inject `speckit.clarify` at any workflow stage when ambiguity or missing information is detected.
- **FR-013**: The orchestrator MUST inject other relevant Speckit command templates according to workflow stage transitions.
- **FR-014**: In plan mode, Prometheus MUST NOT generate implementation code, even when `speckit.implement` is referenced.
- **FR-015**: Once `tasks.md` is complete and the user asks to implement, the system MUST switch to build mode automatically and begin execution workflow.
- **FR-016**: The user MUST receive clear status feedback for mode transitions, delegated reviews, and artifact completion milestones.

### Key Entities *(include if feature involves data)*

- **Intent Classification**: Categorized interpretation of the user request that determines whether specify, clarify, plan, tasks, or build flow is activated.
- **Agent Profile**: Named agent definition (Prometheus, Momus, Metis, Librarian, Oracle) including role and configurable model assignment.
- **Workflow Mode**: Active operating phase for the conversation (planning/specify-oriented mode or build/execution-oriented mode).
- **Specification Review Result**: Structured output from the review subagent indicating approval status, identified gaps, and required adjustments.
- **Planning Artifact Set**: Collection of files required to complete planning (`spec.md`, `plan.md`, stage artifacts, and `tasks.md`) under Speckit directory standards.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of planning-required prompts are routed to specify mode in the first workflow response.
- **SC-002**: At least 95% of sampled draft specs with seeded omissions are flagged by the review subagent before planning is finalized.
- **SC-003**: 100% of test runs that complete planning produce the full required planning artifact set in Speckit-standard directories without manual path correction.
- **SC-004**: 100% of implementation requests received after task completion trigger automatic transition to build mode, with zero implementation code produced by Prometheus while still in plan mode.
- **SC-005**: Configuration updates to per-agent model assignments are reflected in the next run for all five supported agents without requiring workflow redesign.

## Assumptions

- Existing Speckit command templates and planning stages are available and remain the baseline flow definition.
- A build-mode execution path already exists and can be triggered after planning completion.
- Users can interact in natural language and do not need to provide explicit slash commands for each phase.
- The plugin scope is limited to planning orchestration behavior and does not redefine business-domain implementation rules.
- Legacy agents outside Prometheus, Momus, Metis, Librarian, and Oracle are intentionally excluded from this plugin scope.
