# Prometheus Runtime Hook Integration Tasks

**Source Plan:** `docs/plans/2026-04-12-prometheus-runtime-hook-integration.md`

## Phase 1: Runtime activation

- [ ] T001 Create `tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts`
- [ ] T002 Modify `src/prometheus-speckit/prometheus-speckit.ts` to register `experimental.chat.system.transform`
- [ ] T003 Modify `src/prometheus-speckit/prometheus-speckit.ts` to register `chat.message`
- [ ] T004 Modify `src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts` to support session-aware runtime entry
- [ ] T005 Run `npm test -- tests/integration/prometheus-speckit/plugin-runtime-hooks.test.ts`

## Phase 2: Hook resolution and stage-aware injection

- [ ] T006 Create `tests/unit/prometheus-speckit/hook-resolver.test.ts`
- [ ] T007 Fix nested hook lookup in `src/prometheus-speckit/core/hook-resolver.ts`
- [ ] T008 Modify `src/prometheus-speckit/prometheus-speckit.ts` to register `command.execute.before`
- [ ] T009 Adjust `src/prometheus-speckit/core/template-injector.ts` only if command-to-template mapping needs extraction
- [ ] T010 Run `npm test -- tests/unit/prometheus-speckit/hook-resolver.test.ts`

## Phase 3: Real delegated subagent path

- [ ] T011 Create `src/prometheus-speckit/runtime/subagent-delegator.ts`
- [ ] T012 Create `tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts`
- [ ] T013 Modify `src/prometheus-speckit/review/review-client.ts` to replace simulated review calls
- [ ] T014 Modify `src/prometheus-speckit/prometheus-speckit.ts` to initialize and use the runtime delegator
- [ ] T015 Modify `src/prometheus-speckit/config/model-config.ts` only as needed for runtime delegation inputs
- [ ] T016 Run `npm test -- tests/integration/prometheus-speckit/subagent-delegation-runtime.test.ts`

## Phase 4: Packaging hardening and full verification

- [ ] T017 Create `tests/unit/prometheus-speckit/plugin-module-shape.test.ts`
- [ ] T018 Modify `src/prometheus-speckit/prometheus-speckit.ts` to export a stable `server` plugin shape
- [ ] T019 Modify `package.json` to keep `main`/`exports` aligned with the runtime entrypoint
- [ ] T020 Run `npm test && npm run lint`
- [ ] T021 Execute manual validation for natural prompt → specify → delegated review flow

## Exit criteria

- [ ] Prometheus starts spec-driven flow without manual slash-command orchestration
- [ ] System/stage context is injected into the session
- [ ] `before_specify` and related hooks are resolved from `.specify/extensions.yml`
- [ ] Spec review is delegated to `Momus` instead of simulated locally
- [ ] Runtime no longer falls back to default explorer behavior for Prometheus-owned orchestration paths
