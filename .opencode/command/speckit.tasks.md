---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs: 
  - label: Analyze For Consistency
    agent: speckit.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before tasks generation)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_tasks` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    
    Wait for the result of the hook command before proceeding to the Outline.
    ```
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

**State Machine Gate**: Before executing task generation, enforce sequential validation:

1. **Check State File**: Read `.specify/feature-state.json`
   - If file does not exist: ERROR "No feature state found. Please run `/speckit.specify` first."

2. **Verify SPEC_VALIDATED Checkpoint**:
   - If `checkpoints.SPEC_VALIDATED.status` is NOT "approved":
     - ERROR "Cannot proceed to task generation. The specification must be validated first."
   - If `artifacts.spec.hash` exists and spec file exists:
     - Calculate current spec hash
     - If different from stored hash:
       - **Invalidate checkpoint**: Update state file:
         - Set `checkpoints.SPEC_VALIDATED.status` to "pending"
         - Add invalidation note
       - ERROR "The spec has been modified since validation. Please re-validate the spec first."

3. **Verify PLAN_VALIDATED Checkpoint**:
   - If `checkpoints.PLAN_VALIDATED.status` is NOT "approved":
     - ERROR "Cannot proceed to task generation. The implementation plan must be validated by Metis first (PLAN_VALIDATED checkpoint required)."
     - Show current checkpoint status to user
   - If checkpoint is approved: Proceed to Setup

4. **Check for Stale Plan**:
   - If `artifacts.plan.hash` exists and plan file exists:
     - Calculate current plan file hash
     - If different from stored hash:
       - **Invalidate checkpoint**: Update `.specify/feature-state.json`:
         - Set `checkpoints.PLAN_VALIDATED.status` to "pending"
         - Set `checkpoints.PLAN_VALIDATED.timestamp` to null
         - Add to `checkpoints.PLAN_VALIDATED.notes`: "Invalidated due to plan modification"
         - Add to `artifacts.plan.validation_history`: new entry with result="invalidated", reason="artifact_modified"
         - Set `artifacts.plan.status` to "draft"
       - ERROR "The plan file has been modified since last validation. PLAN_VALIDATED checkpoint is now invalid. Please re-validate the plan with Metis before proceeding to tasks."

5. **Proceed with Setup** only after all gate checks pass

1. **Setup**: Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (interface contracts), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map interface contracts to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.specify/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Update Feature State File**: After generating tasks.md, update `.specify/feature-state.json`:
   - Read current state from `.specify/feature-state.json`
   - Set `current_stage` to "tasks"
   - Update `artifacts.tasks.path` to tasks.md path
   - Set `artifacts.tasks.status` to "draft"
   - Update `artifacts.tasks.last_modified` to current ISO 8601 timestamp
   - Calculate SHA256 hash of tasks.md content and set `artifacts.tasks.hash`
   - Update `updated_at` to current ISO 8601 timestamp
   - Write updated state to `.specify/feature-state.json`

5.5. **Check Prerequisite Checkpoints**: Before delegating to Oracle, verify both checkpoints exist:
   - Read `.specify/feature-state.json`
   - If `checkpoints.SPEC_VALIDATED.status` is NOT "approved": ERROR "Cannot proceed to tasks validation. Spec must be validated first."
   - If `checkpoints.PLAN_VALIDATED.status` is NOT "approved": ERROR "Cannot proceed to tasks validation. Plan must be validated by Metis first."
   - If both checkpoints exist and are approved: Proceed to step 5.6

5.6. **Delegate to Oracle for Tasks Validation**: After tasks.md generation, invoke Oracle to validate the tasks:
   
   a. **Load Oracle agent definition**: Read `.opencode/agents/oracle-validation.md`
   
   b. **Prepare delegation prompt**: Include:
      - Path to tasks.md
      - Path to plan.md (for alignment check)
      - Summary of task structure
      - Reference to SPEC_VALIDATED and PLAN_VALIDATED checkpoints
   
   c. **Output delegation notice**:
      ```
      ## Tasks Validation by Oracle
      
      Delegating task validation to Oracle for architecture verification before implementation.
      
      Agent: Oracle (task validator)
      Artifact: <TASKS_FILE>
      Checkpoint: TASKS_VALIDATED
      Prerequisites: SPEC_VALIDATED, PLAN_VALIDATED (verified)
      ```
   
   d. **Log delegation**: Update `.specify/feature-state.json`:
      - Set `artifacts.tasks.status` to "in_review"
      - Add validation attempt entry with agent="Oracle", result="pending"
   
   e. **Await Oracle response**:
   
      **Retry Loop for Rejection**:
      - If Oracle returns APPROVED: Proceed to step 6
      - If Oracle returns REJECTED with gaps:
        1. Read current retry count from `.specify/feature-state.json` → `checkpoints.TASKS_VALIDATED.retry_count`
        2. If retry_count >= max_retries (default: 3):
           - Update checkpoint status to "rejected"
           - Report failure: "Maximum retry limit reached. Tasks validation failed after N attempts."
           - HALT - do not proceed to implementation
        3. Increment retry_count and update in state
        4. Present gaps to user with this format:
           ```
           ## Oracle Validation Feedback
           
           **Status**: REJECTED (Retry N/M)
           
           The following gaps were found:
           
           | # | Category | Issue | Task ID | Severity | Recommendation |
           |---|----------|-------|---------|----------|----------------|
           | 1 | ... | ... | T00X | blocking | ... |
           
           Please address these gaps and the tasks will be re-validated.
           ```
        5. Wait for user to update tasks.md with corrections
        6. After user confirms update, re-validate by re-running step 5.6 (delegate to Oracle again)
        7. User edits during retry loop do NOT consume a retry increment
      - If Oracle returns ERROR: Report error and pause advancement

   f. **On Approval**: When Oracle returns APPROVED:
      - Update `.specify/feature-state.json`:
        - Set `checkpoints.TASKS_VALIDATED.status` to "approved"
        - Set `checkpoints.TASKS_VALIDATED.timestamp` to current ISO 8601
        - Set `checkpoints.TASKS_VALIDATED.agent` to "Oracle"
        - Set `checkpoints.TASKS_VALIDATED.notes` to Oracle summary
        - Set `artifacts.tasks.status` to "approved"
        - Set `current_stage` to "implement"
      - Log validation success

6. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

7. **Check for extension hooks**: After tasks.md is generated, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_tasks` key
   - If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
   - Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
   - For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
     - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
     - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
   - For each executable hook, output the following based on its `optional` flag:
     - **Optional hook** (`optional: true`):
       ```
       ## Extension Hooks

       **Optional Hook**: {extension}
       Command: `/{command}`
       Description: {description}

       Prompt: {prompt}
       To execute: `/{command}`
       ```
     - **Mandatory hook** (`optional: false`):
       ```
       ## Extension Hooks

       **Automatic Hook**: {extension}
       Executing: `/{command}`
       EXECUTE_COMMAND: {command}
       ```
   - If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

Context for task generation: $ARGUMENTS

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label  
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Interfaces/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each interface contract → to the user story it serves
   - If tests requested: Each interface contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns
