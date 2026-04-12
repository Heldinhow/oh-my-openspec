# Tasks: Prometheus Subagent Orchestration Architecture

**Input**: Design documents from `specs/004-prometheus-subagent-architecture/`
**Prerequisites**: plan.md (approved), spec.md (approved), research.md, data-model.md, contracts/

## Organization

Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create agent types enum (primary|subagent) in `.src/agents/types.ts`
- [x] T002 [P] Define Agent interface in `.src/agents/agent.interface.ts`
- [x] T003 [P] Create SubagentRegistry with registered subagent types in `.src/agents/registry.ts`
- [x] T004 [P] Implement OrchestrationSession entity and lifecycle management in `.src/orchestration/orchestration-session.ts`
- [x] T005 [P] Create SpawnRequest entity and data structure in `.src/orchestration/spawn-request.ts`
- [x] T006 Setup spawn-authorizer.ts with primary-only authorization check logic in `.src/orchestration/spawn-authorizer.ts`
- [x] T007 Create SpawnViolation tracker in `.src/orchestration/violation-tracker.ts`
- [x] T008 Configure logging infrastructure for orchestration events in `.src/orchestration/logger.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Prometheus Spawns Subagent for Task (Priority: P1) 🎯 MVP

**Goal**: Prometheus can spawn subagents when specialized capabilities are needed

**Independent Test**: Verify Prometheus spawns exactly one subagent of correct type and receives result

### Implementation for User Story 1

- [x] T009 [US1] Implement primary agent verification in spawn-authorizer.ts
- [x] T010 [US1] Create SubagentFactory in `.src/agents/factory.ts` for spawning subagent instances
- [x] T011 [US1] Implement SpawnRequest creation and approval flow in `.src/orchestration/spawn-request.ts`
- [x] T012 [US1] Add timeout enforcement for subagent lifecycle in OrchestrationSession
- [x] T013 [US1] Implement result reporting back to Prometheus in `.src/agents/subagent.ts`
- [x] T014 [US1] Add exponential backoff retry logic for subagent spawn failures in `.src/orchestration/spawn-authorizer.ts`
- [x] T015 [US1] Add logging for spawn operations in `.src/orchestration/logger.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 3: User Story 2 - Subagent Operates Under Prometheus Control (Priority: P1) 🎯 MVP

**Goal**: Subagents cannot spawn primary agents - attempts are denied and Prometheus is notified

**Independent Test**: Verify subagent attempting to spawn primary agent is blocked with notification

### Implementation for User Story 2

- [x] T016 [US2] Implement primary-agent spawn denial in `.src/orchestration/spawn-authorizer.ts`
- [x] T017 [US2] Create SpawnViolation record on denied attempts in `.src/orchestration/violation-tracker.ts`
- [x] T018 [US2] Implement Prometheus notification for spawn violations in `.src/orchestration/orchestration-session.ts`
- [x] T019 [US2] Add authorization check at spawn request initiation in `.src/orchestration/spawn-authorizer.ts`
- [x] T020 [US2] Add logging for violation events in `.src/orchestration/logger.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: User Story 3 - Prometheus Coordinates Multiple Subagents (Priority: P2)

**Goal**: Prometheus can coordinate 5+ concurrent subagents with proper sequencing and aggregation

**Independent Test**: Verify Prometheus spawns N subagents, coordinates parallel execution, and aggregates results

### Implementation for User Story 3

- [x] T021 [P] [US3] Implement concurrent spawn support in `.src/orchestration/orchestration-session.ts`
- [x] T022 [P] [US3] Add dependency tracking between subagents in `.src/orchestration/orchestration-session.ts`
- [x] T023 [US3] Implement result aggregation from multiple subagents in `.src/orchestration/orchestration-session.ts`
- [x] T024 [US3] Add high-load spawn queuing when capacity is reached in `.src/orchestration/orchestration-session.ts`
- [x] T025 [US3] Add queue position reporting for queued spawn requests in `.src/orchestration/orchestration-session.ts`
- [x] T026 [US3] Implement Prometheus unavailability handling (subagent state maintenance) in `.src/orchestration/orchestration-session.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 5: Edge Cases & Polish

**Purpose**: Handle edge cases identified in spec

- [x] T027 [P] Handle unknown subagent type error with suggested types in `.src/orchestration/spawn-authorizer.ts`
- [x] T028 [P] Add contract test for spawn-authorization.schema.json validation
- [x] T029 Integration test for complete spawn flow
- [x] T030 Integration test for violation notification flow
- [ ] T031 Run quickstart.md validation checklist
- [x] T032 Update existing prometheus-filter hook to enforce subagent constraint in `.specify/extensions/prometheus-filter/hook.(sh|ps1)`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies - can start immediately
- **User Stories (Phase 2-4)**: All depend on Foundational phase completion
- **Polish (Phase 5)**: Depends on user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on US1 (but they share foundational components)
- **User Story 3 (P2)**: Can start after Foundational - Can run in parallel with US1/US2

### Within Each User Story

- Foundational components (types, interfaces) before business logic
- Authorization checks before spawn execution
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- US2 tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Foundational
2. Complete Phase 2: User Story 1
3. Complete Phase 3: User Story 2
4. **STOP and VALIDATE**: Core constraint enforcement works
5. Deploy/demo if ready

### Full Delivery

1. Complete Phase 1: Foundational
2. Complete Phase 2: User Story 1 (MVP)
3. Complete Phase 3: User Story 2 (MVP)
4. Deploy MVP with core constraint enforcement
5. Complete Phase 4: User Story 3 (multi-subagent coordination)
6. Complete Phase 5: Edge cases and polish
7. Final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
