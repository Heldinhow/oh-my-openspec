# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

---

## Validation Checkpoint

> **⚠️ ORCHESTRATION**: This artifact requires Metis analysis before tasks.md generation.
> 
> **Checkpoint**: `PLAN_VALIDATED` must be recorded in `.specify/feature-state.json`
> **Agent**: Metis (gap analyzer)
> **Gate**: Metis approval required before `tasks.md` creation begins
> **Prerequisite**: `SPEC_VALIDATED` checkpoint must exist

---

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

### Purpose
This section defines the technical boundaries and constraints for implementation. Fill in each field with concrete values or mark as "NEEDS CLARIFICATION" if unknown.

### Fields to Complete

**Technology Stack**:
- **Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]
- **Primary Dependencies**: [Major frameworks, libraries (e.g., FastAPI, UIKit, LLVM) or NEEDS CLARIFICATION]

**Infrastructure**:
- **Storage**: [Database, file system, external services or N/A]
- **Target Platform**: [Linux server, iOS 15+, WASM, browser or NEEDS CLARIFICATION]
- **Project Type**: [library, CLI, web-service, mobile-app, compiler, desktop-app or NEEDS CLARIFICATION]

**Non-Functional Requirements**:
- **Performance Goals**: [Specific metrics - e.g., "1000 req/s", "10k lines/sec", "60 fps" or NEEDS CLARIFICATION]
- **Constraints**: [Critical limits - e.g., "<200ms p95", "<100MB memory", "offline-capable" or NEEDS CLARIFICATION]
- **Scale/Scope**: [Expected magnitude - e.g., "10k users", "1M LOC", "50 screens" or NEEDS CLARIFICATION]

**Testing**:
- **Test Framework**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]
- **Coverage Target**: [e.g., "80% unit tests", "contract tests for all APIs" or NEEDS CLARIFICATION]

### Technical Context Example (for reference)

**Good Example** (concrete values):
```
Language/Version: Python 3.11  
Primary Dependencies: FastAPI 0.100+, Pydantic 2.0+, PostgreSQL client  
Storage: PostgreSQL 15+  
Target Platform: Linux server  
Project Type: REST API web service  
Performance Goals: 1000 req/s sustained, <200ms p95 response  
Constraints: <500MB memory usage, must work offline for critical operations  
Scale/Scope: 10k concurrent users, 100 API endpoints  
Testing: pytest, 80% coverage target, contract tests for all endpoints  
```

**Placeholder Example** (needs work):
```
Language/Version: NEEDS CLARIFICATION  
Primary Dependencies: NEEDS CLARIFICATION  
Storage: N/A  
Target Platform: NEEDS CLARIFICATION  
Project Type: NEEDS CLARIFICATION  
Performance Goals: NEEDS CLARIFICATION  
Constraints: NEEDS CLARIFICATION  
Scale/Scope: NEEDS CLARIFICATION  
Testing: NEEDS CLARIFICATION  
```

## Constitution Check

### Purpose
Verify that the proposed implementation aligns with project governance principles before Phase 0 research begins. Re-check after Phase 1 design.

### Pre-Phase 0 Gate Review

Review each constitutional principle and mark as **PASS** or **FAIL**:

| Principle | Result | Notes |
|-----------|--------|-------|
| I. Autonomous Operation | [PASS/FAIL] | [Does the design allow full autonomous execution without human intervention?] |
| II. Production-Quality Code | [PASS/FAIL] | [Does the design include quality controls, error handling, and testing strategy?] |
| III. Test-First Discipline | [PASS/FAIL] | [Are tests defined before implementation? Are contract tests included?] |
| IV. Observability & Debuggability | [PASS/FAIL] | [Are logging, tracing, and debuggability addressed?] |
| V. Simplicity & YAGNI | [PASS/FAIL] | [Is the scope minimal? Are unnecessary abstractions avoided?] |
| Architecture Constraints | [PASS/FAIL] | [Modular? Factory pattern? Barrel exports? LOC limits?] |

### Post-Phase 1 Re-Check

After Phase 1 design artifacts are complete, re-evaluate:

**Gate Result**: [PASS/FAIL]

**Notes**: [Document any violations and their justifications]

### Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

### Constitutional Guidance Reference

For detailed principles, see `.specify/memory/constitution.md`

## Project Structure

### Documentation Structure (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Validated specification (/speckit.specify command output)
├── research.md          # Phase 0 output - research findings and decisions
├── data-model.md        # Phase 1 output - entity definitions and relationships
├── quickstart.md        # Phase 1 output - getting started guide
├── contracts/           # Phase 1 output - interface definitions
│   └── [contract-name].md
├── checklists/          # Validation checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code Structure Options

Select the appropriate structure for your project. Remove unused options.

**Option A: Single Project (Default for libraries, CLI tools)**
```
src/
├── models/              # Domain models and entities
├── services/            # Business logic services
├── cli/                 # Command-line interface
├── api/                 # API definitions (if applicable)
└── lib/                 # Internal libraries

tests/
├── unit/                # Unit tests
├── integration/         # Integration tests
└── contract/            # Contract/API tests

config/                  # Configuration files
scripts/                 # Build/run scripts
```

**Option B: Web Application (when "frontend" + "backend" detected)**
```
backend/
├── src/
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── api/             # REST endpoints
│   └── middleware/      # Request/response processing
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── scripts/             # DB migrations, seeding

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── services/        # API client services
│   ├── hooks/           # Custom React hooks
│   └── store/           # State management
├── tests/
│   ├── unit/
│   └── e2e/
└── public/              # Static assets

shared/                  # Types, utilities shared between frontend/backend
```

**Option C: Mobile + API (when "iOS/Android" detected)**
```
api/
├── src/
│   ├── models/          # Domain models
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   └── middleware/      # Processing
└── tests/

ios/                     # iOS project (Swift/SwiftUI)
├── App/                 # App entry point
├── Features/            # Feature modules
├── Shared/              # Shared code
└── Tests/

android/                 # Android project (Kotlin)
├── app/
│   ├── src/main/
│   └── src/test/
└── gradle/
```

**Option D: Monorepo (multiple packages)**
```
packages/
├── shared/              # Shared utilities and types
│   ├── src/
│   └── package.json
├── core/               # Core business logic
│   ├── src/
│   └── package.json
└── [service-name]/     # Individual services
    ├── src/
    └── package.json

apps/
├── web/                # Web application
├── mobile/             # Mobile application
└── [app-name]/        # Other applications
```

### Structure Decision

**Selected Structure**: [Document which option above applies]

**Rationale**: [Explain why this structure fits the feature requirements]

**Key Directories to Create**: [List specific directories that will exist after implementation]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

---

## Orchestration Section

*For Prometheus orchestrator use*

| Field | Value |
|-------|-------|
| Requires Validation | Yes (Metis) |
| Validation Gate | PLAN_VALIDATED checkpoint required |
| Previous Checkpoint | SPEC_VALIDATED (required) |
| Next Artifact | tasks.md |
| Delegation Agent | Metis |

---

## Validation History

| Timestamp | Agent | Result | Notes |
|-----------|-------|--------|-------|
| [DATE] | Metis | PENDING | Awaiting initial analysis |
