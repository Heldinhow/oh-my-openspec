---
title: "feat: Speckit Artifact Validation Orchestration"
type: feat
status: active
date: 2026-04-12
origin: specs/002-speckit-artifact-validation/spec.md
---

# Speckit Artifact Validation Orchestration

## Overview

Build an OpenCode plugin workflow that combines OMO-style subagent orchestration with Speckit planning flow, ensuring automatic validation at each artifact level (spec, plan, tasks) with natural intent-driven workflow navigation — no manual `/speckit.` commands required.

## Problem Frame

The prometheus-speckit plugin needs to guarantee quality gates at each Speckit artifact level through multi-agent validation, while providing a natural conversational experience where the orchestrator automatically navigates between workflow stages without user command invocation.

## Requirements Trace

- R1: Spec artifacts MUST be validated by Momus before plan generation (FR-001)
- R2: Plan artifacts MUST be validated by Metis before tasks generation (FR-002)
- R3: Tasks artifacts MUST be validated by Oracle before implementation (FR-003)
- R4: Sequential validation enforcement: spec → plan → tasks → implement (FR-007)
- R5: Automatic workflow transitions without `/speckit.` commands (FR-015, FR-016, FR-017)
- R6: Plugin template files for spec, plan, and tasks artifacts (FR-021, FR-022, FR-023, FR-024)
- R7: Validation state tracking with checkpoint invalidation on modification (FR-006, FR-008, FR-009)
- R8: Natural language prompts for clarification and user interaction (FR-018)

## Scope Boundaries

- **In Scope**: Validation orchestration, automatic stage transitions, plugin template files, state tracking
- **Out of Scope**: Build/implementation execution (handled by separate flow), legacy constitution-based guidance

## Constitution Check

*GATE: Must pass before implementation. Re-check after Phase 1 design.*

### Pre-Implementation Gate Review

- **I. Autonomous Operation**: PASS - Natural-language intent routing and automatic stage delegation remove manual orchestration.
- **II. Production-Quality Code**: PASS - Validation loop with Momus/Metis/Oracle review ensures quality gates.
- **III. Test-First Discipline**: PASS - Phase 5 integration tests validate complete workflow before implementation.
- **IV. Observability & Debuggability**: PASS - State machine and delegation logging provide traceable workflow history.
- **V. Simplicity & YAGNI**: PASS - Scope limited to validation orchestration, no over-engineering.
- **Architecture Constraints**: PASS - Modular design with clear separation: templates → state → delegation → transitions.

### Post-Phase 1 Re-Check

- **Gate Result**: Pending
- **Notes**: Will re-verify after Phase 1 (templates and state schema) is complete.

## Context & Research

### Relevant Code and Patterns

- Existing Speckit command templates: `.opencode/command/speckit.*.md`
- Existing plugin structure from feature 001: `specs/001-prometheus-speckit-plugin/`
- OMO orchestration patterns: `docs/guide/orchestration.md`
- Validation agent roles: Momus (review), Metis (gap analysis), Oracle (validation)

### External References

- OMO multi-agent orchestration: `/Users/helder/Projetos/oh-my-openagent/docs/guide/orchestration.md`

## Key Technical Decisions

- **Validation Loop**: Each artifact requires approval from designated agent before workflow advances
- **State Persistence**: Feature state file tracks validation checkpoints with timestamps
- **Template Location**: Plugin templates stored in `.specify/templates/` alongside Speckit templates
- **Sequential Enforcement**: Workflow engine blocks advancement if prior validation not approved
- **Agent Delegation Pattern**: Prometheus (orchestrator) delegates to validation agents after each artifact generation, waits for feedback, and routes results back for corrections

## Orchestration Flow (Delegation Pattern)

```
User Input (Natural Language)
        │
        ▼
┌─────────────────────────────────────────┐
│  Prometheus (Orchestrator)              │
│  1. Detects intent → auto-start spec  │
│  2. After spec.md created             │
│     └─→ DELEGATE to Momus              │
│         (spec reviewer agent)          │
│  3. Momus returns feedback            │
│  4. If gaps → Prometheus corrects      │
│  5. If approved → auto-start plan     │
│     └─→ DELEGATE to Metis              │
│         (gap analyzer agent)           │
│  6. Metis returns analysis             │
│  7. If gaps → Prometheus corrects      │
│  8. If approved → auto-start tasks    │
│     └─→ DELEGATE to Oracle             │
│         (architecture validator)        │
│  9. Oracle returns validation          │
│ 10. If gaps → Prometheus corrects      │
│ 11. If approved → enable implement    │
└─────────────────────────────────────────┘
        │
        ▼
Implementation Ready
```

**Critical**: At each stage, Prometheus MUST delegate to the designated validation agent BEFORE advancing to the next stage. The orchestrator never skips validation.

## Open Questions

### Resolved During Planning

- Template format: Markdown with placeholder syntax (consistent with existing Speckit templates)
- Validation retry: Configurable limit (default 3) with re-validation on user edits

### Deferred to Implementation

- Exact placeholder syntax for templates
- State file JSON schema details
- Validation feedback schema format

## Implementation Units

- [ ] **Unit 1: Plugin Template Files**

**Goal:** Create template files for spec, plan, and tasks artifacts

**Requirements:** R6

**Dependencies:** None

**Files:**
- Create: `.specify/templates/prometheus-spec-template.md`
- Create: `.specify/templates/prometheus-plan-template.md`
- Create: `.specify/templates/prometheus-tasks-template.md`

**Approach:**
- Templates follow existing Speckit template structure
- Include validation checkpoint markers and orchestration-specific sections
- Placeholder syntax for dynamic content (e.g., `{{FEATURE_NAME}}`, `{{VALIDATION_STATE}}`)

**Patterns to follow:**
- Existing Speckit templates: `spec-template.md`, `plan-template.md`, `tasks-template.md`

**Test scenarios:**
- Happy path: Templates are loadable and parseable in all environments
- Edge case: Missing template file produces clear error message
- Edge case: Corrupted template file produces clear error message

**Verification:**
- Template files exist at expected paths
- Templates contain required sections and placeholder markers

---

- [ ] **Unit 2: Validation State Management**

**Goal:** Implement validation state tracking with persistent feature state file

**Requirements:** R7

**Dependencies:** Unit 1 (templates needed for state schema)

**Files:**
- Create: `.specify/templates/feature-state-template.json`
- Modify: `.opencode/command/speckit.specify.md` (add state initialization)
- Modify: `.opencode/command/speckit.clarify.md` (update state)
- Modify: `.opencode/command/speckit.plan.md` (update state)
- Modify: `.opencode/command/speckit.tasks.md` (update state)

**Approach:**
- JSON-based feature state file per feature directory
- State contains: artifact validation status, timestamps, retry counts, checkpoint approvals
- Workflow commands read/write state at appropriate stages
- Feature state template references prometheus-spec-template.md placeholders

**Patterns to follow:**
- Existing Speckit state tracking: `.specify/feature.json`
- OMO state management patterns

**Test scenarios:**
- Happy path: State file created on spec creation with initial pending states
- Happy path: State updated after each validation checkpoint
- Edge case: State file missing triggers recovery or error
- Edge case: Invalid JSON in state file triggers error

**Verification:**
- State file created at `specs/{feature-dir}/.state.json`
- Validation statuses correctly tracked across stages
- Checkpoint timestamps recorded

---

- [ ] **Unit 3: Validation Agent Delegation**

**Goal:** Implement the delegation pattern where Prometheus delegates to validation agents after each artifact creation

**Requirements:** R1, R2, R3

**Dependencies:** Unit 1, Unit 2

**Files:**
- Create: `.opencode/agents/momus-review.md` (Momus spec reviewer agent definition)
- Create: `.opencode/agents/metis-analysis.md` (Metis gap analyzer agent definition)
- Create: `.opencode/agents/oracle-validation.md` (Oracle architecture validator agent definition)
- Modify: `.opencode/command/speckit.specify.md` (add Momus delegation after spec.md created)
- Modify: `.opencode/command/speckit.plan.md` (add Metis delegation after plan.md created)
- Modify: `.opencode/command/speckit.tasks.md` (add Oracle delegation after tasks.md created)

**Approach:**
- After spec.md is created → Prometheus delegates to Momus with spec content → waits for approval/gaps
- After plan.md is created → Prometheus delegates to Metis with plan content → waits for analysis/gaps
- After tasks.md is created → Prometheus delegates to Oracle with tasks content → waits for validation/gaps
- Each delegation includes: artifact content, validation criteria, expected output schema
- Retry loop: if gaps found, Prometheus corrects and re-delegates (up to max retries)
- Checkpoint recorded only after explicit approval from validation agent

**Delegation Flow (per artifact)**:

```
Prometheus creates artifact (spec/plan/tasks)
        │
        ▼
DELEGATE to [Agent] with:
  - Artifact content
  - Validation criteria from spec
  - Expected feedback schema
        │
        ▼
[Agent] returns:
  - APPROVED: checkpoint recorded, advance stage
  - GAPS FOUND: list of issues, retry loop
  - ERROR: report to user, pause workflow
```

**Patterns to follow:**
- OMO agent delegation patterns from orchestration.md (Task tool with agent parameter)
- Existing OMO agent definitions in `/Users/helder/Projetos/oh-my-openagent/src/agents/`

**Test scenarios:**
- Happy path: Momus returns APPROVED after reviewing complete spec
- Happy path: Metis returns GAPS FOUND with specific missing edge cases in plan
- Happy path: Oracle returns APPROVED after validating task scope and dependencies
- Edge case: Momus unavailable → error reported, workflow paused
- Edge case: Metis returns GAPS FOUND → Prometheus corrects → re-delegates → APPROVED
- Edge case: Max retries (3) reached → failure status, workflow blocked

**Verification:**
- After spec.md creation, Momus is invoked and feedback received before plan starts
- After plan.md creation, Metis is invoked and feedback received before tasks starts
- After tasks.md creation, Oracle is invoked and feedback received before implement
- Each delegation output logged in feature state file

---

- [ ] **Unit 4: Automatic Workflow Transitions**

**Goal:** Implement natural intent-driven flow where orchestrator auto-triggers next stage after validation checkpoint is set

**Requirements:** R5, R8

**Dependencies:** Unit 2, Unit 3

**Files:**
- Modify: `.opencode/command/speckit.specify.md` (auto-transition to Momus review, then to plan after approval)
- Modify: `.opencode/command/speckit.clarify.md` (natural language prompts, state update)
- Modify: `.opencode/command/speckit.plan.md` (auto-transition to Metis review, then to tasks after approval)
- Modify: `.opencode/command/speckit.tasks.md` (auto-transition to Oracle review, then to implement after approval)

**Approach:**
- Each command template modified to check validation state after artifact creation
- If validation checkpoint not set → delegate to appropriate validation agent
- If validation checkpoint set → automatically trigger next workflow stage
- User interaction via natural language only (no command syntax)
- State machine tracks: SPEC_CREATED → SPEC_VALIDATED → PLAN_CREATED → PLAN_VALIDATED → TASKS_CREATED → TASKS_VALIDATED → IMPLEMENT_READY

**State Machine**:

```
                    ┌─────────────────────────┐
                    │  SPEC_CREATED          │
                    │  (after spec.md created)│
                    └───────────┬─────────────┘
                                │ check state
                                ▼
                    ┌─────────────────────────┐
                    │  DELEGATE TO MOMUS     │◄──── retry loop
                    │  (review spec)          │
                    └───────────┬─────────────┘
                                │ Momus APPROVED
                                ▼
                    ┌─────────────────────────┐
                    │  SPEC_VALIDATED ✓      │
                    │  (checkpoint set)       │
                    └───────────┬─────────────┘
                                │ auto-trigger
                                ▼
                    ┌─────────────────────────┐
                    │  PLAN_CREATED          │
                    │  (after plan.md created)│
                    └───────────┬─────────────┘
                                │ check state
                                ▼
                    ┌─────────────────────────┐
                    │  DELEGATE TO METIS     │◄──── retry loop
                    │  (analyze plan)         │
                    └───────────┬─────────────┘
                                │ Metis APPROVED
                                ▼
                    ┌─────────────────────────┐
                    │  PLAN_VALIDATED ✓      │
                    │  (checkpoint set)       │
                    └───────────┬─────────────┘
                                │ auto-trigger
                                ▼
                    ┌─────────────────────────┐
                    │  TASKS_CREATED          │
                    │  (after tasks.md created)│
                    └───────────┬─────────────┘
                                │ check state
                                ▼
                    ┌─────────────────────────┐
                    │  DELEGATE TO ORACLE    │◄──── retry loop
                    │  (validate tasks)        │
                    └───────────┬─────────────┘
                                │ Oracle APPROVED
                                ▼
                    ┌─────────────────────────┐
                    │  TASKS_VALIDATED ✓     │
                    │  (checkpoint set)       │
                    └───────────┬─────────────┘
                                │ auto-trigger
                                ▼
                    ┌─────────────────────────┐
                    │  IMPLEMENT_READY        │
                    │  (build mode enabled)   │
                    └─────────────────────────┘
```

**Patterns to follow:**
- OMO natural intent flow patterns
- Existing speckit command templates
- State machine pattern from workflow engines

**Test scenarios:**
- Happy path: spec.md created → Momus review → SPEC_VALIDATED → auto-trigger plan.md
- Happy path: plan.md created → Metis analysis → PLAN_VALIDATED → auto-trigger tasks.md
- Happy path: tasks.md created → Oracle validation → TASKS_VALIDATED → auto-trigger implement
- Edge case: Out-of-sequence request explains what must happen first ("spec must be validated first")
- Edge case: User edits spec after SPEC_VALIDATED → checkpoint invalidated → re-validation required

**Verification:**
- Each state transition logged with timestamp
- Checkpoint set only after explicit agent approval
- Auto-trigger fires only when checkpoint is set
- State persists across session restarts

---

- [ ] **Unit 5: Integration and End-to-End Testing**

**Goal:** Validate complete workflow from intent to implementation-ready tasks

**Requirements:** All

**Dependencies:** Unit 1, Unit 2, Unit 3, Unit 4

**Files:**
- Create: `tests/integration/validation-workflow.spec.ts`
- Create: `tests/integration/natural-flow.spec.ts`

**Approach:**
- Integration tests validate complete workflow scenarios
- Test each validation stage, state transition, and automatic handoff
- Test natural language prompts and responses

**Patterns to follow:**
- Existing test patterns from feature 001

**Test scenarios:**
- Happy path: Complete spec → plan → tasks flow with all validations passing
  - User input → spec.md created → Momus APPROVED → plan.md created → Metis APPROVED → tasks.md created → Oracle APPROVED → implement ready
- Edge case: Validation failure triggers retry and correction
  - spec.md created → Momus GAPS → Prometheus corrects → re-delegate → Momus APPROVED
- Edge case: Artifact modification invalidates checkpoint
  - SPEC_VALIDATED → user edits spec.md → SPEC_VALIDATED invalidated → Momus re-validation required
- Edge case: Max retries reached produces failure status
  - spec.md created → Momus GAPS (3 retries) → FAILURE status, workflow blocked
- Integration: Verify each delegation call logs agent response in state file
- Integration: Verify state machine transitions only on checkpoint, not on artifact creation

**Verification:**
- All integration tests pass
- 100% sequential validation enforcement
- 100% automatic stage transitions
- Each delegation explicitly logged with agent response

---

## System-Wide Impact

- **Interaction graph:** Workflow commands read/write feature state; validation agents (Momus, Metis, Oracle) read artifacts and write feedback via delegation
- **Error propagation:** Validation failures block advancement; state file errors halt workflow
- **State lifecycle risks:** Partial writes must be atomic; concurrent access must be handled
- **API surface parity:** Plugin modifies existing speckit commands to add delegation, does not add new commands
- **Integration coverage:** End-to-end flow requires all units working together

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Validation agents may be unavailable | Error handling with user notification and retry |
| Template customization conflicts with updates | Merge strategy for template updates |
| State file corruption | Backup and recovery mechanism |
| Circular dependency in validation loop | Cycle detection and max retry limit |

## Documentation / Operational Notes

- Plugin templates supersede Speckit defaults when plugin is active
- User template customizations preserved across workflow stages
- State file format documented for debugging

## Sources & References

- **Origin document:** [specs/002-speckit-artifact-validation/spec.md](../002-speckit-artifact-validation/spec.md)
- Related code: `.opencode/command/speckit.*.md`
- Related spec: [specs/001-prometheus-speckit-plugin/plan.md](../001-prometheus-speckit-plugin/plan.md)
- OMO patterns: `/Users/helder/Projetos/oh-my-openagent/docs/guide/orchestration.md`
