# Quickstart: Prometheus Subagent Orchestration Architecture

## Goal

Implement and validate the architectural constraint that only Prometheus can operate as a primary agent, with all other agents functioning as subagents spawned by Prometheus.

## Preconditions

- Feature branch is active: `004-prometheus-subagent-architecture`
- Feature directory exists: `specs/004-prometheus-subagent-architecture`
- Spec is validated by Momus
- Agent hierarchy: Prometheus (primary) → Subagents (Momus, Metis, Librarian, Oracle, etc.)

## Implementation Validation

After implementation, verify:

1. **Primary Agent Spawn Verification**: Only Prometheus can successfully spawn subagents
2. **Subagent Constraint Test**: Subagents attempting to spawn primary agents are denied
3. **Multi-Subagent Coordination**: Prometheus can coordinate at least 5 concurrent subagents
4. **Lifecycle Completion**: All spawned subagents complete within timeout window
5. **Violation Notification**: Prometheus is notified when spawn violations occur

## Architecture Flow

### Subagent Spawn Flow (Valid)

```
User Request → Prometheus (primary) → Evaluates capability needs 
→ Creates SpawnRequest → Authorization check (PASS) → Subagent spawned 
→ Task assigned → Result reported to Prometheus → Subagent terminates/idle
```

### Violation Flow (Blocked)

```
Subagent → Attempts to spawn primary agent → SpawnRequest created 
→ Authorization check (FAIL: not Prometheus) → Request denied 
→ SpawnViolation created → Prometheus notified → Subagent notified of denial
```

## Key Enforcement Points

| Point | What Gets Checked | Enforcement |
|-------|-------------------|-------------|
| Spawn Request | Is requestor Prometheus (primary)? | Authorization check before spawn |
| Primary Spawn | Is target a primary agent? | Denied if subagent requests primary |
| Traceability | Which Prometheus initiated spawn? | session_id + requestor_id logged |
| Lifecycle | Does subagent report back? | Completion timeout enforcement |

## Validation Checklist

- [x] Prometheus spawns subagent successfully (US1)
- [x] Subagent spawn of primary agent is blocked (US2)
- [x] Prometheus coordinates multiple subagents (US3)
- [x] Subagent failure triggers retry/exponential backoff
- [x] Unknown subagent type returns error with suggestions
- [x] Prometheus unavailability maintains subagent state
- [x] High-load spawn requests are queued
- [x] All spawn operations are traceable to Prometheus
- [x] 100% of primary agent spawns are blocked from subagents
