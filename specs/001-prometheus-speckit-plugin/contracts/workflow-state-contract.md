# Contract: Workflow State and Command Injection

## Purpose

Define the expected behavior for stage transitions, command-template injection, and delegated review orchestration.

## Actors

- **User**: Sends natural-language requests and optional implementation request.
- **Prometheus**: Primary orchestrator and stage manager.
- **Subagents**: Momus, Metis, Librarian, Oracle (delegated roles, model-configurable).

## Input Contract

### User Request Envelope

```json
{
  "message": "string",
  "session_id": "string",
  "timestamp": "datetime"
}
```

### Agent Routing Configuration

```json
{
  "agents": {
    "Prometheus": {"model_provider": "string", "model_name": "string", "enabled": true},
    "Momus": {"model_provider": "string", "model_name": "string", "enabled": true},
    "Metis": {"model_provider": "string", "model_name": "string", "enabled": true},
    "Librarian": {"model_provider": "string", "model_name": "string", "enabled": true},
    "Oracle": {"model_provider": "string", "model_name": "string", "enabled": true}
  }
}
```

## Behavior Contract

1. Prometheus classifies intent into supported categories.
2. If planning is required, Prometheus enters specify mode and injects `speckit.specify`.
3. Prometheus may inject `speckit.clarify` at any stage when ambiguity is detected.
4. Draft spec must be delegated to a configured subagent review.
5. Review feedback with gaps must return to Prometheus for correction loop.
6. Planning artifacts must be generated under Speckit feature directory.
7. Prometheus must not output implementation code in plan mode.
8. After tasks completion and implementation request, mode transitions automatically to build.

## Output Contract

```json
{
  "session_id": "string",
  "current_mode": "plan|build",
  "current_stage": "specify|clarify|plan|tasks|handoff|build",
  "injected_commands": ["speckit.specify", "speckit.clarify"],
  "review": {
    "approved": "boolean",
    "gaps": ["string"]
  },
  "artifacts": {
    "feature_directory": "string",
    "spec": "string",
    "plan": "string",
    "tasks": "string"
  }
}
```

## Invariants

- Only five agents are valid participants.
- `current_mode=plan` implies no implementation code generation by Prometheus.
- Build transition requires completed tasks and explicit implementation request.
