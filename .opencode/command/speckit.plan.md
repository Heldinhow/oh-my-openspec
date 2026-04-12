---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs: 
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before planning)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_plan` key
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

**State Machine Gate**: Before executing plan workflow, enforce sequential validation:

1. **Check State File**: Read `.specify/feature-state.json`
   - If file does not exist: ERROR "No feature state found. Please run `/speckit.specify` first to create the specification."

2. **Verify SPEC_VALIDATED Checkpoint**:
   - If `checkpoints.SPEC_VALIDATED.status` is NOT "approved":
     - ERROR "Cannot proceed to plan generation. The specification must be validated by Momus first (SPEC_VALIDATED checkpoint required)."
     - Show current checkpoint status to user
   - If checkpoint is approved: Proceed to Setup

3. **Check for Stale Spec**:
   - If `artifacts.spec.hash` exists and spec file exists:
     - Calculate current spec file hash
     - If different from stored hash:
       - **Invalidate checkpoint**: Update `.specify/feature-state.json`:
         - Set `checkpoints.SPEC_VALIDATED.status` to "pending"
         - Set `checkpoints.SPEC_VALIDATED.timestamp` to null
         - Add to `checkpoints.SPEC_VALIDATED.notes`: "Invalidated due to spec modification"
         - Add to `artifacts.spec.validation_history`: new entry with result="invalidated", reason="artifact_modified"
         - Set `artifacts.spec.status` to "draft"
       - ERROR "The spec file has been modified since last validation. SPEC_VALIDATED checkpoint is now invalid. Please re-validate the spec with Momus before proceeding to plan."

4. **Proceed with Setup** only after all gate checks pass

1. **Setup**: Run `.specify/scripts/powershell/setup-plan.ps1 -Json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied).

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design

   3.5. **Update Feature State File**: After generating plan.md, update `.specify/feature-state.json`:
    - Read current state from `.specify/feature-state.json`
    - Set `current_stage` to "plan"
    - Update `artifacts.plan.path` to IMPL_PLAN path
    - Set `artifacts.plan.status` to "draft"
    - Update `artifacts.plan.last_modified` to current ISO 8601 timestamp
    - Calculate SHA256 hash of plan.md content and set `artifacts.plan.hash`
    - Update `updated_at` to current ISO 8601 timestamp
    - Write updated state to `.specify/feature-state.json`

3.6. **Check Prerequisite Checkpoint**: Before delegating to Metis, verify `SPEC_VALIDATED` checkpoint exists:
   - Read `.specify/feature-state.json`
   - If `checkpoints.SPEC_VALIDATED.status` is NOT "approved": ERROR "Cannot proceed to plan validation. Spec must be validated by Momus first (SPEC_VALIDATED checkpoint required)."
   - If checkpoint exists and is approved: Proceed to step 3.7

3.7. **Delegate to Metis for Plan Validation**: After plan.md generation, invoke Metis to analyze the plan:
   
   a. **Load Metis agent definition**: Read `.opencode/agents/metis-analysis.md`
   
   b. **Prepare delegation prompt**: Include:
      - Path to IMPL_PLAN (plan.md)
      - Path to FEATURE_SPEC (spec.md for context)
      - Summary of plan content
      - Reference to SPEC_VALIDATED checkpoint
   
   c. **Output delegation notice**:
      ```
      ## Plan Validation by Metis
      
      Delegating plan analysis to Metis for gap detection before task generation.
      
      Agent: Metis (gap analyzer)
      Artifact: <IMPL_PLAN>
      Checkpoint: PLAN_VALIDATED
      Prerequisite: SPEC_VALIDATED (verified)
      ```
   
   d. **Log delegation**: Update `.specify/feature-state.json`:
      - Set `artifacts.plan.status` to "in_review"
      - Add validation attempt entry with agent="Metis", result="pending"
   
   e. **Await Metis response**:
   
      **Retry Loop for Rejection**:
      - If Metis returns APPROVED: Proceed to step 4
      - If Metis returns REJECTED with gaps:
        1. Read current retry count from `.specify/feature-state.json` → `checkpoints.PLAN_VALIDATED.retry_count`
        2. If retry_count >= max_retries (default: 3):
           - Update checkpoint status to "rejected"
           - Report failure: "Maximum retry limit reached. Plan validation failed after N attempts."
           - HALT - do not proceed to tasks
        3. Increment retry_count and update in state
        4. Present gaps to user with this format:
           ```
           ## Metis Analysis Feedback
           
           **Status**: REJECTED (Retry N/M)
           
           The following gaps were found:
           
           | # | Category | Gap | Severity | Recommendation |
           |---|----------|-----|----------|----------------|
           | 1 | ... | ... | blocking | ... |
           
           Please address these gaps and the plan will be re-analyzed.
           ```
        5. Wait for user to update IMPL_PLAN with corrections
        6. After user confirms update, re-analyze by re-running step 3.7 (delegate to Metis again)
        7. User edits during retry loop do NOT consume a retry increment
      - If Metis returns ERROR: Report error and pause advancement

   f. **On Approval**: When Metis returns APPROVED:
      - Update `.specify/feature-state.json`:
        - Set `checkpoints.PLAN_VALIDATED.status` to "approved"
        - Set `checkpoints.PLAN_VALIDATED.timestamp` to current ISO 8601
        - Set `checkpoints.PLAN_VALIDATED.agent` to "Metis"
        - Set `checkpoints.PLAN_VALIDATED.notes` to Metis summary
        - Set `artifacts.plan.status` to "approved"
      - Log validation success

4. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

5. **Check for extension hooks**: After reporting, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_plan` key
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

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Define interface contracts** (if project has external interfaces) → `/contracts/`:
   - Identify what interfaces the project exposes to users or other systems
   - Document the contract format appropriate for the project type
   - Examples: public APIs for libraries, command schemas for CLI tools, endpoints for web services, grammars for parsers, UI contracts for applications
   - Skip if project is purely internal (build scripts, one-off tools, etc.)

3. **Agent context update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
