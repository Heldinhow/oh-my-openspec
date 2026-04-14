---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Validation Checkpoint

> **⚠️ ORCHESTRATION**: This artifact requires Oracle validation before implementation begins.
> 
> **Checkpoint**: `TASKS_VALIDATED` must be recorded in `.specify/feature-state.json`
> **Agent**: Oracle (architecture validator)
> **Gate**: Oracle approval required before implementation mode begins
> **Prerequisites**: `SPEC_VALIDATED` and `PLAN_VALIDATED` checkpoints must exist

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**What to include**:
- Language/framework initialization (package.json, pyproject.toml, Cargo.toml, etc.)
- Development tooling (linters, formatters, type checkers)
- Test framework setup
- IDE/config files (.gitignore, .editorconfig, etc.)

**Task naming patterns**:
- T001 Create project structure per implementation plan
- T002 Initialize [language] project with [framework] dependencies
- T003 [P] Configure linting and formatting tools
- T004 [P] Setup test framework with [test runner]
- T005 Add CI/CD configuration for [CI platform]

**Example**:
- [ ] T001 Create project structure per implementation plan (src/, tests/, config/)
- [ ] T002 Initialize Node.js 20 project with TypeScript and npm dependencies
- [ ] T003 [P] Configure ESLint and Prettier for consistent code style
- [ ] T004 [P] Setup Vitest test runner with coverage reporting
- [ ] T005 Add GitHub Actions workflow for CI pipeline

**Note**: Mark tasks as [P] when they can run in parallel (different files, no dependencies)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**What to include** (select based on project type):
- Database schema and migrations
- Authentication/authorization framework
- API routing and middleware structure
- Base models/entities that all stories depend on
- Error handling and logging infrastructure
- Environment configuration management
- Shared utilities and constants

**Task naming patterns**:
- T00X Setup database schema and migrations framework
- T00X [P] Implement authentication/authorization framework
- T00X [P] Setup API routing and middleware structure
- T00X Create base models/entities that all stories depend on
- T00X Configure error handling and logging infrastructure
- T00X Setup environment configuration management

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers - what the user can do after this is complete]

**Independent Test**: [How to verify this story works on its own - what action proves it works]

**Link to Spec**: User Story 1 from spec.md - [story title]

### What to include in this phase

**Tests (if requested by spec)**:
- Contract/API tests for external interfaces
- Integration tests for user journeys
- Unit tests for business logic

**Implementation**:
- Domain models/entities for this story
- Services/business logic
- API endpoints or UI components
- Validation and error handling
- Logging and observability

**Task naming patterns**:
- T0XX [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].ts
- T0XX [P] [US1] Integration test for [user journey] in tests/integration/test_[name].ts
- T0XX [P] [US1] Create [Entity] model in src/models/[entity].ts
- T0XX [US1] Implement [Service] in src/services/[service].ts
- T0XX [US1] Implement [endpoint/feature] in src/[location]/[file].ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

**Link to Spec**: User Story 2 from spec.md - [story title]

### What to include in this phase

**Tests (if requested by spec)**:
- Contract/API tests for external interfaces
- Integration tests for user journeys

**Implementation**:
- Domain models/entities for this story
- Services/business logic
- API endpoints or UI components
- Integration with User Story 1 components (if needed)

**Task naming patterns**:
- T0XX [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].ts
- T0XX [P] [US2] Integration test for [user journey] in tests/integration/test_[name].ts
- T0XX [P] [US2] Create [Entity] model in src/models/[entity].ts
- T0XX [US2] Implement [Service] in src/services/[service].ts
- T0XX [US2] Implement [endpoint/feature] in src/[location]/[file].ts
- T0XX [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

**Link to Spec**: User Story 3 from spec.md - [story title]

### What to include in this phase

**Tests (if requested by spec)**:
- Contract/API tests for external interfaces
- Integration tests for user journeys

**Implementation**:
- Domain models/entities for this story
- Services/business logic
- API endpoints or UI components

**Task naming patterns**:
- T0XX [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].ts
- T0XX [P] [US3] Integration test for [user journey] in tests/integration/test_[name].ts
- T0XX [P] [US3] Create [Entity] model in src/models/[entity].ts
- T0XX [US3] Implement [Service] in src/services/[service].ts
- T0XX [US3] Implement [endpoint/feature] in src/[location]/[file].ts

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

**What to include**:
- Documentation updates and README improvements
- Code cleanup, refactoring, and technical debt resolution
- Performance optimization across all stories
- Additional unit tests (if not covered by user story tasks)
- Security hardening and edge case handling
- Integration testing and end-to-end validation
- Quickstart.md validation and getting started guide updates

**Task naming patterns**:
- TXXX [P] Update documentation in docs/ or README.md
- TXXX Refactor [component] for improved maintainability
- TXXX Optimize performance for [specific operation]
- TXXX [P] Add unit tests for [module] in tests/unit/
- TXXX Security hardening for [component]
- TXXX Run quickstart.md validation and fix issues

**Example**:
- [ ] T037 [P] Update API documentation in docs/api.md
- [ ] T038 Refactor error handling for consistency across services
- [ ] T039 Performance optimization - add caching for frequent queries
- [ ] T040 [P] Add unit tests for utility functions in tests/unit/utils.test.ts
- [ ] T041 Security hardening - add input validation and sanitization
- [ ] T042 Run quickstart.md end-to-end validation

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Dependencies | Can Start |
|-------|--------------|-----------|
| **Setup (Phase 1)** | None | Immediately |
| **Foundational (Phase 2)** | Setup complete | After Phase 1 |
| **User Stories (Phase 3+)** | Foundational complete | After Phase 2 |
| **Polish (Final Phase)** | All user stories complete | After all user stories |

### User Story Dependencies

| User Story | Dependencies | Can Start |
|-----------|--------------|-----------|
| **US1 (P1)** | Foundational complete | After Phase 2 |
| **US2 (P2)** | Foundational complete | After Phase 2 |
| **US3 (P3)** | Foundational complete | After Phase 2 |

**Note**: While user stories can start in parallel after foundational, each story should be independently testable. Avoid cross-story dependencies that break this independence.

### Within Each User Story

Execute in this order:
1. **Tests first** (if included) - Write tests that FAIL before implementation
2. **Models before services** - Entity definitions before business logic
3. **Services before endpoints** - Business logic before API/external interfaces
4. **Core before integration** - Implement core functionality before wiring it together
5. **Story complete** - Verify the entire story works before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Task Quality Guidelines

### What Makes a Good Task

**Specific**: Clear about WHAT and WHERE
- Good: "Create User model in src/models/user.ts with id, email, name, createdAt fields"
- Bad: "Create user model"

**Verifiable**: Can check completion independently
- Good: "Add login endpoint returning 200 OK for valid credentials"
- Bad: "Make login work"

**Atomic**: Single focused change
- Good: "Add password field to User entity"
- Bad: "Add user authentication"

**Traceable**: Links to requirements
- Good: "Implement FR-003: password reset flow"
- Bad: "Add some security features"

### Task ID Convention

- **T001-T099**: Phase 1-2 (Setup + Foundational)
- **T100-T199**: User Story 1 (US1)
- **T200-T299**: User Story 2 (US2)
- **T300-T399**: User Story 3 (US3)
- **T400+**: Polish phase

### File Path Conventions

| Project Type | Source | Tests |
|-------------|--------|-------|
| Single project | `src/` | `tests/` |
| Web app | `backend/src/`, `frontend/src/` | `backend/tests/`, `frontend/tests/` |
| Mobile + API | `api/src/`, `ios/src/` | `api/tests/`, `ios/Tests/` |
| Monorepo | `packages/[name]/src/` | `packages/[name]/tests/` |

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Orchestration Section

*For Prometheus orchestrator use*

| Field | Value |
|-------|-------|
| Requires Validation | Yes (Oracle) |
| Validation Gate | TASKS_VALIDATED checkpoint required |
| Previous Checkpoints | SPEC_VALIDATED, PLAN_VALIDATED (both required) |
| Next Stage | Implementation |
| Delegation Agent | Oracle |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Validation History

| Timestamp | Agent | Result | Notes |
|-----------|-------|--------|-------|
| [DATE] | Oracle | PENDING | Awaiting initial validation |
