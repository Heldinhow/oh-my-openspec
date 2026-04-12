<!--
## Sync Impact Report

**Version Change**: 0.1.0 → 1.0.0 (MINOR - Initial constitution with full principle set)

**Modified Principles**: None (initial constitution)

**Added Sections**:
- I. Autonomous Operation (Human Intervention is a Failure Signal)
- II. Production-Quality Code (Indistinguishable from Senior Engineer)
- III. Test-First Discipline (NON-NEGOTIABLE)
- IV. Observability & Debugggability
- V. Simplicity & YAGNI
- VI. Architecture Constraints (Modular Code, Factory Pattern, Barrel Exports)
- VII. Development Workflow (Feature Branches, User Story Prioritization)
- VIII. Governance (Amendment Procedure, Compliance Verification)

**Removed Sections**: None

**Templates Requiring Updates**: ⚠ pending (to be validated)
- ✅ .specify/templates/constitution-template.md
- ⚠ .specify/templates/plan-template.md (Constitution Check section placeholder)
- ⚠ .specify/templates/spec-template.md
- ⚠ .specify/templates/tasks-template.md
- ⚠ .specify/templates/checklist-template.md
- ⚠ .specify/templates/agent-file-template.md

**Follow-up TODOs**:
- TODO(RATIFICATION_DATE): Initial constitution - ratification date to be determined by project owner
-->

# oh-my-openspec Constitution

## Core Principles

### I. Autonomous Operation
Every feature MUST be implemented to completion without requiring human intervention. Human intervention during agentic work is a failure signal. The agent MUST work like a compiler: specification goes in, working code comes out. If a human must correct, guide step-by-step, or clarify mid-implementation, the system has failed and MUST be redesigned.

### II. Production-Quality Code (NON-NEGOTIABLE)
Code written by the agent MUST be indistinguishable from code written by a senior engineer. This means: following existing codebase patterns exactly, proper error handling without being asked, tests that actually test the right things, no over-engineering, comments only when they add value. If you can tell whether a commit was made by a human or an agent, the agent has failed.

### III. Test-First Discipline (NON-NEGOTIABLE)
TDD is mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle MUST be strictly enforced. Tests MUST be written before implementation and MUST fail initially. Contract tests are REQUIRED for new library/service boundaries.

### IV. Observability & Debugggability
Text I/O ensures debuggability. Structured logging is REQUIRED for all operations. Content verification (hashline) MUST be used for edit safety. Every Read operation MUST be tagged with content hashes. Edits MUST reject on hash mismatch.

### V. Simplicity & YAGNI
Start simple. Avoid over-engineering, unnecessary abstractions, and organizational-only libraries. Every library MUST have a clear, standalone purpose. No organizational-only abstractions. YAGNI principles MUST be followed unless explicitly justified.

## Architecture Constraints

### Code Organization
- **Modular Code**: Every feature starts as a standalone module; Modules MUST be self-contained, independently testable, documented
- **Factory Pattern**: createXXX() factory functions for all tools, hooks, and agents
- **Barrel Exports**: Use index.ts barrel files for module boundaries; No catch-all files (utils.ts, helpers.ts, service.ts are BANNED)
- **200 LOC Soft Limit**: Keep files under 200 lines; Split larger modules
- **No Suppressors**: Never use `as any`, `@ts-ignore`, `@ts-expect-error`; Never suppress lint/type errors

### Configuration
- **Multi-Level Config**: Project → User → Defaults hierarchy with deep merge for nested fields
- **Disabled Arrays**: Set union (concatenated + deduplicated) for disabled_*
- **Format**: JSONC with comments, schema validation, snake_case keys

### Tool & Hook System
- **26 Tools** across categories: Task Management, Delegation, Agent Invocation, Background Tasks, LSP Refactoring, Code Search, Session History, Skill/Command, System, Editing
- **52 Lifecycle Hooks** in 3 tiers: Core, Continuation, Skill
- **Delegation Categories**: visual-engineering, ultrabrain, deep, artistry, quick, unspecified-low, unspecified-high, writing

## Development Workflow

### Branching & Commit
- Feature branches for ALL changes (format: `###-feature-name`)
- Commits only when explicitly requested
- Atomic commits per logical change

### User Story Delivery
- User stories MUST be prioritized (P1, P2, P3)
- Each user story MUST be independently testable
- User stories MUST be independently deployable
- Tests (if requested) MUST fail before implementation

### Task Organization
- Tasks grouped by user story for independent implementation
- [P] denotes parallelizable tasks (different files, no dependencies)
- Foundational phase MUST block all user story work
- Checkpoints at each phase completion

## Governance

### Constitution Authority
This constitution supersedes all other practices. All PRs/reviews MUST verify compliance with these principles. Complexity deviations MUST be justified in the plan and approved.

### Amendment Procedure
1. Proposed changes documented with rationale
2. Impact assessment on all templates and workflows
3. Migration plan for existing projects
4. Approval required before implementation
5. Version bump according to semantic rules:
   - MAJOR: Backward incompatible governance/principle removals
   - MINOR: New principle/section added or materially expanded
   - PATCH: Clarifications, wording, typo fixes

### Compliance Review
- Constitution Check GATE before Phase 0 research
- Re-check after Phase 1 design
- All deviations documented with justification

### Runtime Guidance
Use `.specify/memory/constitution.md` for development guidance. Templates in `.specify/templates/` provide the standard workflow. Commands in `.opencode/command/` provide executable workflows.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Initial constitution - date to be determined | **Last Amended**: 2026-04-12
