# Data Model: Prometheus Permissions

## Entities

### PermissionRule

```typescript
interface PermissionRule {
  id: string;                    // Unique identifier
  agent: string;                 // "prometheus" | "*" for all
  extensions: string[];           // [".md", ".markdown"]
  directories: string[];          // Glob patterns: ["src/**", "tests/**"]
  operations: Operation[];        // ["read", "write", "edit", "delete", "rename"]
  effect: "allow" | "deny";      // Rule effect
  message?: string;               // Custom error message
}

type Operation = "read" | "write" | "edit" | "create" | "delete" | "rename";
```

### AuditLog

```typescript
interface AuditLog {
  timestamp: string;              // ISO 8601
  agent: string;                  // Agent name
  operation: Operation;           // Operation attempted
  target: string;                 // File/directory path
  result: "allowed" | "denied";  // Outcome
  reason?: string;                // Reason code (e.g., "extension-not-allowed")
}
```

### AgentContext

```typescript
interface AgentContext {
  agent: string;                  // Agent identifier
  currentStage: Stage;            // specify | clarify | plan | tasks | implement
  allowedExtensions: string[];    // What agent can write
  blockedDirectories: string[];   // Where agent cannot write
  permissionsSource: string;       // Path to permissions.json
}

type Stage = "specify" | "clarify" | "plan" | "tasks" | "implement";
```

## Relationships

```
AgentContext (1) --> (N) PermissionRule
PermissionRule (N) --> (1) AuditLog (via outcome)
```

## Evaluation Order

1. **Extension check first**: If target extension is not in `allowed_extensions` → deny
2. **Directory check second**: If target path matches any `blocked_directories` pattern → deny
3. **Operation check third**: If operation is in `blocked_operations` → deny

## Example Configuration

```json
{
  "version": "1.0",
  "agents": {
    "prometheus": {
      "allowed_extensions": [".md"],
      "blocked_directories": ["src/**", "tests/**", "lib/**", "bin/**", "obj/**", ".specify/scripts/**"],
      "blocked_operations": ["write", "edit", "create", "delete", "rename"]
    }
  },
  "audit": {
    "enabled": true,
    "log_file": ".specify/audit.log"
  }
}
```

**Note**: Stage-based restriction (FR-006) is enforced by workflow design. Prometheus never receives implement commands - this is handled by the orchestration layer, not by the file filter hook.
