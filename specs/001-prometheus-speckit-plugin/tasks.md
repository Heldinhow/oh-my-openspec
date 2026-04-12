# Tasks: Prometheus Speckit Orchestration Plugin

**Input**: Design documents from `/specs/001-prometheus-speckit-plugin/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because plan.md defines contract validation and integration flow scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and execution scaffolding

- [x] T001 Create plugin source and test folder structure in `src/prometheus-speckit/` and `tests/{unit,integration,contract}/prometheus-speckit/`
- [x] T002 Create plugin entrypoint and module barrel exports in `src/prometheus-speckit/index.ts` and `src/prometheus-speckit/core/index.ts`
- [x] T003 [P] Configure TypeScript build and scripts in `package.json` and `tsconfig.json`
- [x] T004 [P] Configure test runner for unit/integration/contract suites in `vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core orchestration infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Define workflow and intent domain types from design model in `src/prometheus-speckit/core/workflow-types.ts`
- [x] T006 [P] Implement five-agent registry and role metadata in `src/prometheus-speckit/agents/registry.ts`
- [x] T007 [P] Implement model configuration loader and schema validator in `src/prometheus-speckit/config/model-config.ts`
- [x] T008 Implement stage transition state machine for `specify|clarify|plan|tasks|handoff|build` in `src/prometheus-speckit/core/stage-machine.ts`
- [x] T009 [P] Implement stage-aware Speckit command template injector in `src/prometheus-speckit/core/template-injector.ts`
- [x] T010 Implement extension hook discovery and filtering service in `src/prometheus-speckit/core/hook-resolver.ts`
- [x] T011 Create default per-agent model mapping for Prometheus, Momus, Metis, Librarian, Oracle in `.config/opencode/agents.models.jsonc`
- [x] T012 Add foundational integration coverage for state machine and model config loading in `tests/integration/prometheus-speckit/foundation.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Natural Intent-to-Spec Flow (Priority: P1) 🎯 MVP

**Goal**: Route natural requests into the correct planning path and auto-enter specify when needed

**Independent Test**: Submit feature/fix/refactor prompts and confirm intent classification plus automatic `speckit.specify` injection for planning-required requests

### Tests for User Story 1

- [x] T013 [P] [US1] Add contract tests for intent classification outcomes in `tests/contract/prometheus-speckit/intent-classification.contract.test.ts`
- [x] T014 [P] [US1] Add integration test for automatic specify entry behavior in `tests/integration/prometheus-speckit/specify-entry.test.ts`

### Implementation for User Story 1

- [x] T015 [P] [US1] Implement natural-language intent classifier for feature/fix/refactor/other in `src/prometheus-speckit/orchestrator/intent-classifier.ts`
- [x] T016 [US1] Implement planning-required decision policy in `src/prometheus-speckit/orchestrator/planning-gate.ts`
- [x] T017 [US1] Wire classifier, planning gate, and stage machine into orchestrator entrypoint in `src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts`
- [x] T018 [US1] Update natural conversation to specify handoff guidance in `.opencode/command/speckit.specify.md`
- [x] T019 [US1] Implement user-facing routing and mode transition messages in `src/prometheus-speckit/orchestrator/status-messages.ts`

**Checkpoint**: User Story 1 should be independently functional and testable

---

## Phase 4: User Story 2 - Spec Review Loop with Subagent Models (Priority: P2)

**Goal**: Enforce delegated spec review with model-configurable subagents and closed-loop gap resolution

**Independent Test**: Produce a draft spec with seeded gaps and confirm delegated review flags issues, returns feedback, and drives a successful correction cycle

### Tests for User Story 2

- [x] T020 [P] [US2] Add contract tests for review result payload and gap semantics in `tests/contract/prometheus-speckit/spec-review.contract.test.ts`
- [x] T021 [P] [US2] Add integration test for delegated review retry loop in `tests/integration/prometheus-speckit/spec-review-loop.test.ts`

### Implementation for User Story 2

- [x] T022 [P] [US2] Implement delegated review client with per-agent model selection in `src/prometheus-speckit/review/review-client.ts`
- [x] T023 [US2] Implement spec gap reconciliation loop back to Prometheus in `src/prometheus-speckit/review/gap-reconciliation.ts`
- [x] T024 [US2] Enforce allowed agent guardrails for Prometheus, Momus, Metis, Librarian, Oracle in `src/prometheus-speckit/agents/agent-guard.ts`
- [x] T025 [US2] Enable clarify injection from any stage in `.opencode/command/speckit.clarify.md`
- [x] T026 [US2] Persist review cycle state and approval status in `src/prometheus-speckit/review/review-state-store.ts`

**Checkpoint**: User Story 2 should be independently functional and testable

---

## Phase 5: User Story 3 - Complete Planning Artifacts and Build Handoff (Priority: P3)

**Goal**: Complete Speckit-standard planning artifacts and switch automatically to build mode on implementation request after tasks completion

**Independent Test**: Complete specify/plan/tasks flow, then request implementation and verify automatic build handoff with zero plan-mode code generation by Prometheus

### Tests for User Story 3

- [x] T027 [P] [US3] Add contract tests for required planning artifact set completeness in `tests/contract/prometheus-speckit/artifact-set.contract.test.ts`
- [x] T028 [P] [US3] Add integration test for automatic plan-to-build handoff in `tests/integration/prometheus-speckit/build-handoff.test.ts`

### Implementation for User Story 3

- [x] T029 [P] [US3] Implement planning artifact tracker for `spec.md`, `plan.md`, `tasks.md`, and stage files in `src/prometheus-speckit/planning/artifact-tracker.ts`
- [x] T030 [US3] Implement mode transition controller from plan to build in `src/prometheus-speckit/orchestrator/mode-transition.ts`
- [x] T031 [US3] Implement plan-mode guard for `speckit.implement` references in `src/prometheus-speckit/orchestrator/plan-mode-guard.ts`
- [x] T032 [US3] Update implement command workflow for automatic build-mode handoff in `.opencode/command/speckit.implement.md`
- [x] T033 [P] [US3] Update guidance source from constitution to AGENTS in `.opencode/command/speckit.specify.md`
- [x] T034 [P] [US3] Update guidance source from constitution to AGENTS in `.opencode/command/speckit.plan.md`
- [x] T035 [P] [US3] Update guidance source from constitution to AGENTS in `.opencode/command/speckit.tasks.md`
- [x] T036 [P] [US3] Update guidance source from constitution to AGENTS in `.opencode/command/speckit.clarify.md`

**Checkpoint**: User Story 3 should be independently functional and testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and rollout readiness across all user stories

- [x] T037 [P] Document configuration and orchestration examples in `docs/prometheus-speckit-workflow.md`
- [x] T038 [P] Add unit tests for edge cases (invalid provider, premature implement request, unavailable subagent model) in `tests/unit/prometheus-speckit/edge-cases.test.ts`
- [x] T039 Validate and refine end-to-end quickstart steps in `specs/001-prometheus-speckit-plugin/quickstart.md`
- [x] T040 Capture rollout checklist and release readiness notes in `specs/001-prometheus-speckit-plugin/release-readiness.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - starts immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2 - delivers MVP
- **Phase 4 (US2)**: Depends on Phase 2 and US1 orchestrator baseline (`T017`)
- **Phase 5 (US3)**: Depends on Phase 2 and benefits from US1/US2 orchestration capabilities
- **Phase 6 (Polish)**: Depends on completion of desired user stories

### User Story Dependencies

- **US1 (P1)**: No user-story dependencies after foundation
- **US2 (P2)**: Depends on US1 baseline routing to generate draft specs for review
- **US3 (P3)**: Depends on US1 routing and US2 review loop for full planning-to-build handoff confidence

### Within Each User Story

- Tests are created before implementation tasks
- Domain/state definitions before orchestration integration
- Command template updates after corresponding runtime behavior exists
- Story checkpoint must pass before marking story complete

### Parallel Opportunities

- Setup: `T003`, `T004` can run in parallel
- Foundational: `T006`, `T007`, `T009` can run in parallel after `T005`
- US1: `T013`, `T014`, `T015` can run in parallel
- US2: `T020`, `T021`, `T022` can run in parallel
- US3: `T027`, `T028`, `T029`, `T033`, `T034`, `T035` can run in parallel
- Polish: `T037`, `T038` can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch US1 verification tasks together:
Task: "Add contract tests for intent classification outcomes in tests/contract/prometheus-speckit/intent-classification.contract.test.ts"
Task: "Add integration test for automatic specify entry behavior in tests/integration/prometheus-speckit/specify-entry.test.ts"

# Launch US1 implementation tasks with no file conflicts:
Task: "Implement natural-language intent classifier in src/prometheus-speckit/orchestrator/intent-classifier.ts"
Task: "Implement user-facing routing messages in src/prometheus-speckit/orchestrator/status-messages.ts"
```

## Parallel Example: User Story 2

```bash
# Launch US2 tests together:
Task: "Add contract tests for review result payload in tests/contract/prometheus-speckit/spec-review.contract.test.ts"
Task: "Add integration test for delegated review retry loop in tests/integration/prometheus-speckit/spec-review-loop.test.ts"

# Launch US2 independent implementation tasks:
Task: "Implement delegated review client in src/prometheus-speckit/review/review-client.ts"
Task: "Enforce allowed agent guardrails in src/prometheus-speckit/agents/agent-guard.ts"
```

## Parallel Example: User Story 3

```bash
# Launch US3 verification tasks together:
Task: "Add contract tests for planning artifact completeness in tests/contract/prometheus-speckit/artifact-set.contract.test.ts"
Task: "Add integration test for automatic build handoff in tests/integration/prometheus-speckit/build-handoff.test.ts"

# Launch US3 command-guide updates together:
Task: "Update AGENTS guidance in .opencode/command/speckit.specify.md"
Task: "Update AGENTS guidance in .opencode/command/speckit.plan.md"
Task: "Update AGENTS guidance in .opencode/command/speckit.tasks.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate independent US1 behavior from quickstart criteria
4. Demo natural intent routing + automatic specify entry

### Incremental Delivery

1. Deliver US1 (MVP)
2. Add US2 delegated review loop and model configurability
3. Add US3 artifact completion and build handoff automation
4. Finish with Phase 6 polish and rollout readiness

### Parallel Team Strategy

1. Team aligns on Phase 1 and Phase 2 together
2. After foundation completion:
   - Engineer A: US1 runtime and command entry behavior
   - Engineer B: US2 review loop and model selection
   - Engineer C: US3 artifact tracking and handoff transitions
3. Merge by story checkpoints, then execute polish tasks

---

## Notes

- [P] tasks indicate no cross-file dependency on incomplete work
- [USx] labels provide traceability from tasks to user stories
- Each story remains independently testable at its checkpoint
- Use quickstart scenarios as final acceptance confirmation before rollout
