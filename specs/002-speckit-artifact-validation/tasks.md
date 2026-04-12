# Tasks: Speckit Artifact Validation Orchestration

**Input**: Design documents from `/specs/002-speckit-artifact-validation/`
**Prerequisites**: plan.md (complete), spec.md (complete)

**Tests**: This project uses integration tests to validate workflow behavior. Tests are included in the implementation units.

**Organization**: Tasks are grouped by implementation units to enable independent development and testing of each unit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Plugin files: `.specify/templates/`, `.opencode/command/`, `.opencode/agents/`
- Test files: `tests/integration/`
- Paths shown below are relative to repository root

---

## Phase 1: Plugin Template Files [US6]

**Purpose**: Create template files for spec, plan, and tasks artifacts that define structure and placeholders

**User Story**: US6 - Plugin Template Files

**Dependencies**: None

- [ ] T001 Create `.specify/templates/prometheus-spec-template.md` - Template for spec.md with validation checkpoint markers and orchestration sections
- [ ] T002 [P] Create `.specify/templates/prometheus-plan-template.md` - Template for plan.md with validation gates and delegation pattern sections
- [ ] T003 [P] Create `.specify/templates/prometheus-tasks-template.md` - Template for tasks.md with validation criteria and state tracking markers

**Checkpoint**: Templates created and validated for syntax

---

## Phase 2: Validation State Management [US5]

**Purpose**: Implement persistent feature state file to track validation checkpoints across workflow stages

**User Story**: US5 - Validation State Tracking and Rollback

**Dependencies**: Phase 1 complete (templates needed first)

- [ ] T004 Create `.specify/templates/feature-state-template.json` - JSON schema for feature state with validation status, timestamps, retry counts, checkpoints
- [ ] T005 [P] Modify `.opencode/command/speckit.specify.md` to initialize feature state file after spec creation
- [ ] T006 [P] Modify `.opencode/command/speckit.clarify.md` to update state after clarification sessions
- [ ] T007 [P] Modify `.opencode/command/speckit.plan.md` to update state after plan generation
- [ ] T008 Modify `.opencode/command/speckit.tasks.md` to update state after tasks generation

**Checkpoint**: State file created and updated correctly at each workflow stage

---

## Phase 3: Validation Agent Delegation [US2, US3, US4]

**Purpose**: Create agent definitions and integrate delegation into workflow commands

**User Stories**: 
- US2 - Spec-Level Validation with Momus
- US3 - Plan-Level Validation with Metis  
- US4 - Tasks-Level Validation with Oracle

**Dependencies**: Phase 2 complete (state management needed for delegation tracking)

- [ ] T009 Create `.opencode/agents/momus-review.md` - Momus spec reviewer agent definition with validation criteria for spec artifacts [US2]
- [ ] T010 [P] Create `.opencode/agents/metis-analysis.md` - Metis gap analyzer agent definition with validation criteria for plan artifacts [US3]
- [ ] T011 [P] Create `.opencode/agents/oracle-validation.md` - Oracle architecture validator agent definition with validation criteria for task artifacts [US4]
- [ ] T012 Modify `.opencode/command/speckit.specify.md` to delegate to Momus after spec.md creation and handle approval/gaps feedback [US2]
- [ ] T013 Modify `.opencode/command/speckit.plan.md` to delegate to Metis after plan.md creation and handle analysis/gaps feedback [US3]
- [ ] T014 Modify `.opencode/command/speckit.tasks.md` to delegate to Oracle after tasks.md creation and handle validation/gaps feedback [US4]
- [ ] T015 Implement retry loop logic in workflow commands for validation failures with configurable max retries (default: 3) [US2, US3, US4]

**Checkpoint**: Each artifact stage triggers delegation to correct validation agent

---

## Phase 4: Automatic Workflow Transitions [US1, US5]

**Purpose**: Implement state machine for automatic stage transitions after validation checkpoints

**User Stories**:
- US1 - Natural Intent-Driven Speckit Flow
- US5 - Validation State Tracking and Rollback

**Dependencies**: Phase 3 complete (delegation needed for checkpoint triggers)

- [ ] T016 Implement state machine in `.opencode/command/speckit.specify.md` - Check SPEC_VALIDATED checkpoint before allowing plan stage [US1]
- [ ] T017 [P] Implement state machine in `.opencode/command/speckit.plan.md` - Check PLAN_VALIDATED checkpoint before allowing tasks stage [US1]
- [ ] T018 [P] Implement state machine in `.opencode/command/speckit.tasks.md` - Check TASKS_VALIDATED checkpoint before enabling implement mode [US1]
- [ ] T019 Modify `.opencode/command/speckit.clarify.md` to use natural language prompts without command syntax [US1]
- [ ] T020 Implement checkpoint invalidation when validated artifact is modified (auto-detect and require re-validation) [US5]
- [ ] T021 Add state persistence across sessions (feature state file survives session restarts) [US5]

**Checkpoint**: State machine correctly blocks unvalidated stage advancement

---

## Phase 5: Integration and End-to-End Testing [All US]

**Purpose**: Validate complete workflow behavior with integration tests

**User Stories**: All (validates SC-001 to SC-011)

**Dependencies**: Phase 4 complete

- [ ] T022 Create `tests/integration/validation-workflow.spec.ts` - Test complete spec → plan → tasks flow with all validations passing (covers SC-001, SC-002, SC-003)
- [ ] T023 [P] Create `tests/integration/natural-flow.spec.ts` - Test automatic stage transitions and natural language prompts (covers SC-008, SC-009)
- [ ] T024 [P] Create `tests/integration/delegation.spec.ts` - Test each delegation call logs agent response correctly (covers SC-006)
- [ ] T025 Create `tests/integration/state-machine.spec.ts` - Test state transitions only fire on checkpoint, not artifact creation (covers SC-004, SC-005)
- [ ] T026 Create `tests/integration/retry-loop.spec.ts` - Test validation failure triggers retry and max retries respected (covers SC-007)
- [ ] T027 Create `tests/integration/checkpoint-invalidation.spec.ts` - Test artifact modification invalidates checkpoint (covers SC-005)
- [ ] T028 Create `tests/integration/template-conformance.spec.ts` - Test artifacts conform to template structure (covers SC-010, SC-011)

**Checkpoint**: All integration tests pass

---

## Phase 6: Polish & Documentation

**Purpose**: Final documentation and cleanup

**Dependencies**: Phase 5 complete

- [ ] T032 [P] Update `.specify/templates/README.md` if exists with plugin template usage instructions
- [ ] T033 [P] Add validation state file to `.gitignore` if sensitive data present
- [ ] T034 Run quickstart validation to confirm workflow end-to-end
- [ ] T035 Code cleanup and refactoring across all modified files

**Checkpoint**: Project ready for use

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Templates)**: No dependencies - starts immediately
- **Phase 2 (State)**: Depends on Phase 1 - templates needed first
- **Phase 3 (Delegation)**: Depends on Phase 2 - state management needed
- **Phase 4 (Transitions)**: Depends on Phase 3 - delegation needed
- **Phase 5 (Testing)**: Depends on Phase 4 - transitions needed
- **Phase 6 (Polish)**: Depends on Phase 5 - testing needed

### Within Each Phase

- Tasks marked [P] can run in parallel (different files)
- Sequential tasks must complete before dependent phases
- Each phase checkpoint must pass before advancing

### Parallel Opportunities

- Phase 1: T001, T002, T003 run in parallel
- Phase 2: T005, T006, T007, T008 run in parallel
- Phase 3: T009, T010, T011 run in parallel; then T012, T013, T014 run after respective agent files
- Phase 4: T016, T017, T018 run in parallel
- Phase 5: T022, T023, T024, T025, T026, T027 run in parallel
- Phase 6: T032, T033 run in parallel

---

## Implementation Strategy

### Sequential Delivery (Recommended)

1. Complete Phase 1: Templates → Test Templates → Phase 1 checkpoint
2. Complete Phase 2: State Management → Test State → Phase 2 checkpoint
3. Complete Phase 3: Agent Delegation → Test Delegation → Phase 3 checkpoint
4. Complete Phase 4: Workflow Transitions → Test Transitions → Phase 4 checkpoint
5. Complete Phase 5: Integration Tests → All Pass → Phase 5 checkpoint
6. Complete Phase 6: Polish & Docs → Ready for use

### MVP Verification

At each checkpoint, verify:
- Phase 1: Templates loadable and parseable
- Phase 2: State file created and updated at spec stage
- Phase 3: Momus delegation fires after spec.md creation
- Phase 4: Stage advancement blocked without validation checkpoint
- Phase 5: All tests pass

---

## Notes

- [P] tasks = different files, no dependencies
- Each phase builds on previous - don't skip phases
- Verify checkpoint before advancing to next phase
- Integration tests validate end-to-end behavior
- State machine is the critical path for automatic transitions
