# Quickstart: Prometheus Speckit Orchestration Plugin

## Goal

Validate the planning workflow that combines OMO orchestration behavior with Speckit lifecycle templates.

## Preconditions

- Feature branch is active: `001-prometheus-speckit-plugin`
- Feature directory exists: `specs/001-prometheus-speckit-plugin`
- Agent set is restricted to Prometheus, Momus, Metis, Librarian, Oracle
- Agent model mapping is configured in `.config/opencode/agents.models.jsonc`
- Plugin runtime installed: `@opencode-ai/plugin`

## Implementation Validation

After implementation, verify:

1. Run unit tests: `npm test`
2. Run lint: `npm run lint`
3. Verify integration tests pass
4. Verify contract tests pass

## Planning Flow Walkthrough

1. Send a natural-language request to Prometheus (feature/fix/refactor).
2. Confirm intent classification result and planning-required decision.
3. For planning-required requests, confirm automatic specify template injection.
4. Confirm draft spec delegation to a review subagent with configured model.
5. If gaps are found, confirm feedback loop to Prometheus and updated spec generation.
6. Confirm planning artifacts are generated in feature directory (`spec.md`, `plan.md`, related files, `tasks.md`).
7. Ask to implement after tasks completion and confirm automatic transition from plan mode to build mode.

## Expected Outcomes

- No manual slash-command orchestration is required by the user for core planning flow.
- Clarify can be injected at any stage where ambiguity is detected.
- Prometheus does not generate implementation code while in plan mode.
- Build mode handoff occurs automatically after tasks completion and implementation request.

## Validation Checklist

- [x] Intent classification output is visible to the user.
- [x] Delegated review output contains either approval or explicit gaps.
- [x] All artifact paths remain under Speckit-standard directory conventions.
- [x] Active agent/model selections match configuration file entries.
- [x] Phase 1-5 implementation complete (setup, foundational, US1, US2, US3)
- [x] Unit, integration, and contract tests created
- [x] Edge case tests implemented
