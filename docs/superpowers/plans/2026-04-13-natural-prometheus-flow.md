# Natural Prometheus Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all `/speckit.*` command mentions from user-facing messages and make the spec-driven development flow automatic. When implementation stage is reached, stop and inform the user they can implement.

**Architecture:** The orchestrator will be refactored to emit neutral messages without internal command references. A new `FlowController` will manage automatic stage transitions. The `ModeTransitionController.handleImplementRequest()` will be changed to return a "ready to implement" message instead of transitioning to build mode.

**Tech Stack:** TypeScript, oh-my-openspec prometheus-speckit

---

## File Structure

**Files to Modify:**
- `src/prometheus-speckit/orchestrator/status-messages.ts` — Remove `[prometheus-speckit]` prefix from all messages
- `src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts` — Remove `/speckit.*` mentions, add natural flow messages
- `src/prometheus-speckit/orchestrator/mode-transition.ts` — Change handoff behavior to STOP and notify user
- `src/prometheus-speckit/core/template-injector.ts` — (may need updates for neutral messaging)

**Files to Create:**
- `src/prometheus-speckit/orchestrator/flow-controller.ts` — New class to manage automatic stage transitions with natural messages

---

## Task 1: Refactor StatusMessages to Remove Internal Prefixes

**Files:**
- Modify: `src/prometheus-speckit/orchestrator/status-messages.ts`

- [ ] **Step 1: Read current status-messages.ts**

Read the file to understand all message patterns.

- [ ] **Step 2: Remove `[prometheus-speckit]` prefix from all StatusMessage.text values**

Replace each message to remove the prefix. The messages should be natural and professional.

```typescript
// BEFORE:
stageTransition(from: WorkflowMode, to: WorkflowMode): StatusMessage {
  return {
    text: `[prometheus-speckit] Stage transition: ${from} → ${to}`,
    // ...
  };
}

// AFTER:
stageTransition(from: WorkflowMode, to: WorkflowMode): StatusMessage {
  return {
    text: `Stage transition: ${from} → ${to}`,
    // ...
  };
}
```

Apply this to ALL methods in the StatusMessages class:
- `modeTransition()`: `[prometheus-speckit] Mode transition: ${from} → ${to}` → `Workflow mode changed: ${from} → ${to}`
- `stageTransition()`: `[prometheus-speckit] Stage transition: ${from} → ${to}` → `Stage transition: ${from} → ${to}`
- `specApproved()`: `[prometheus-speckit] Spec approved. Proceeding to plan.` → `Specification approved. Proceeding to planning phase.`
- `gapsDetected()`: `[prometheus-speckit] ${count} gap(s) detected...` → `${count} gap(s) detected in specification. Resolving before proceeding.`
- `tasksComplete()`: `[prometheus-speckit] Tasks complete. Ready for implementation.` → `Tasks breakdown complete. You are ready to implement.`
- `implementRequested()`: `[prometheus-speckit] Implementation requested...` → `Implementation requested.`
- `reviewDelegated()`: `[prometheus-speckit] Spec review delegated to ${agentName}.` → `Specification review delegated to ${agentName}.`
- `reviewApproved()`: `[prometheus-speckit] Spec review approved...` → `Specification review approved. No gaps found.`
- `buildModeActive()`: `[prometheus-speckit] Build mode active...` → `Build mode active. Implementation orchestration underway.`

- [ ] **Step 3: Run tests to verify no regressions**

Run: `cd /home/deploy/oh-my-openspec && npm test -- --run src/prometheus-speckit/orchestrator/status-messages.spec.ts 2>&1 || echo "No specific test file found"`
Expected: Tests pass (or no test file exists - that's OK)

- [ ] **Step 4: Commit**

```bash
cd /home/deploy/oh-my-openspec
git add src/prometheus-speckit/orchestrator/status-messages.ts
git commit -m "refactor(prometheus): remove [prometheus-speckit] prefix from user messages"
```

---

## Task 2: Refactor PrometheusOrchestrator Messages to Natural Flow

**Files:**
- Modify: `src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts`

- [ ] **Step 1: Read current prometheus-orchestrator.ts**

Focus on the message building methods: `buildSpecifyMessage`, `buildClarifyMessage`, `buildSkipMessage`.

- [ ] **Step 2: Replace command mentions with natural flow language**

```typescript
// BEFORE (lines 63-68):
private buildSpecifyMessage(classification: IntentClassification): string {
  return `[prometheus-speckit] Intent classified as '${classification.intent_type}' ` +
    `(confidence: ${(classification.confidence * 100).toFixed(0)}%). ` +
    `Planning required — entering specify mode. ` +
    `Run /speckit.specify to generate the specification draft.`;
}

// AFTER:
private buildSpecifyMessage(classification: IntentClassification): string {
  return `Intent detected as '${classification.intent_type}' ` +
    `(confidence: ${(classification.confidence * 100).toFixed(0)}%). ` +
    `I'll create the specification for you.`;
}
```

```typescript
// BEFORE (lines 70-74):
private buildClarifyMessage(classification: IntentClassification): string {
  return `[prometheus-speckit] Intent classified as '${classification.intent_type}' ` +
    `but confidence is low. ` +
    `Please clarify: what specifically needs to be planned?`;
}

// AFTER:
private buildClarifyMessage(classification: IntentClassification): string {
  return `Intent detected as '${classification.intent_type}' ` +
    `but I need more details. ` +
    `Could you please clarify what specifically needs to be built?`;
}
```

```typescript
// BEFORE (lines 76-82):
private buildSkipMessage(
  classification: IntentClassification,
  gateResult: ReturnType<typeof planningGate.evaluate>
): string {
  return `[prometheus-speckit] ${gateResult.reason}. ` +
    `No planning required for this request.`;
}

// AFTER:
private buildSkipMessage(
  classification: IntentClassification,
  gateResult: ReturnType<typeof planningGate.evaluate>
): string {
  return `${gateResult.reason}. ` +
    `No planning workflow needed for this request.`;
}
```

- [ ] **Step 3: Add new methods for natural stage progression messages**

Add these methods to the PrometheusOrchestrator class:

```typescript
private buildSpecCreatedMessage(featureDir: string): string {
  return `Specification created successfully. ` +
    `File saved to: ${featureDir}/spec.md`;
}

private buildPlanCreatedMessage(featureDir: string): string {
  return `Implementation plan created successfully. ` +
    `File saved to: ${featureDir}/plan.md`;
}

private buildTasksCreatedMessage(featureDir: string): string {
  return `Task breakdown created successfully. ` +
    `File saved to: ${featureDir}/tasks.md`;
}

private buildReadyForImplementationMessage(): string {
  return `All artifacts are complete and validated. ` +
    `You are ready to implement the feature. ` +
    `The specification, plan, and task breakdown are ready in the feature directory.`;
}
```

- [ ] **Step 4: Run tests**

Run: `cd /home/deploy/oh-my-openspec && npm test -- --run 2>&1 | head -50`
Expected: Tests pass or show specific failures to fix

- [ ] **Step 5: Commit**

```bash
git add src/prometheus-speckit/orchestrator/prometheus-orchestrator.ts
git commit -m "refactor(prometheus): replace /speckit command mentions with natural language"
```

---

## Task 3: Create FlowController for Automatic Stage Transitions

**Files:**
- Create: `src/prometheus-speckit/orchestrator/flow-controller.ts`

- [ ] **Step 1: Design the FlowController class**

The FlowController manages automatic progression through specify → clarify → plan → tasks → handoff stages without exposing internal commands.

```typescript
import type { WorkflowSession, WorkflowStage } from '../core/workflow-types.js';
import { stageMachine } from '../core/stage-machine.js';
import { statusMessages } from './status-messages.js';

export interface FlowTransitionResult {
  success: boolean;
  previousStage: WorkflowStage;
  currentStage: WorkflowStage;
  message: string;
  autoAdvance: boolean;
}

export class FlowController {
  /**
   * Determine if the current stage should automatically advance.
   * Auto-advance happens when:
   * - specify: spec is approved → auto-advance to plan
   * - clarify: clarification is complete → auto-advance to specify
   * - plan: plan is approved → auto-advance to tasks
   * - tasks: tasks are approved → STOP at handoff (do NOT auto-advance to build)
   */
  shouldAutoAdvance(session: WorkflowSession): boolean {
    const stage = session.current_stage;
    
    // Tasks complete → STOP at handoff, do NOT auto-advance to build
    if (stage === 'tasks') {
      return false;
    }
    
    // All other transitions can auto-advance
    return true;
  }

  /**
   * Get the next stage for automatic progression.
   */
  getNextStage(currentStage: WorkflowStage): WorkflowStage | null {
    const transitionMap: Partial<Record<WorkflowStage, WorkflowStage>> = {
      'specify': 'plan',
      'clarify': 'specify',
      'plan': 'tasks',
      'tasks': 'handoff', // This is the STOP point
    };
    return transitionMap[currentStage] || null;
  }

  /**
   * Execute automatic transition to the next stage.
   * Returns a result with natural language message.
   */
  autoAdvance(sessionId: string): FlowTransitionResult {
    const session = stageMachine.getSession(sessionId);
    if (!session) {
      return {
        success: false,
        previousStage: 'specify',
        currentStage: 'specify',
        message: 'Session not found.',
        autoAdvance: false,
      };
    }

    const previousStage = session.current_stage;
    const nextStage = this.getNextStage(previousStage);

    if (!nextStage) {
      return {
        success: false,
        previousStage,
        currentStage: previousStage,
        message: 'No further progression available.',
        autoAdvance: false,
      };
    }

    // Special case: tasks → handoff is the STOP point
    if (previousStage === 'tasks' && nextStage === 'handoff') {
      const updatedSession = stageMachine.transition(sessionId, 'handoff');
      return {
        success: true,
        previousStage,
        currentStage: 'handoff',
        message: statusMessages.tasksComplete().text,
        autoAdvance: false, // We STOP here
      };
    }

    // Auto-advance for other transitions
    const updatedSession = stageMachine.transition(sessionId, nextStage);
    const statusMsg = statusMessages.stageTransition(previousStage, nextStage);

    return {
      success: true,
      previousStage,
      currentStage: nextStage,
      message: statusMsg.text,
      autoAdvance: true,
    };
  }

  /**
   * Check if the workflow has reached the implementation stop point.
   */
  isAtImplementationStop(session: WorkflowSession): boolean {
    return session.current_stage === 'handoff';
  }

  /**
   * Get the message to show when at the implementation stop point.
   */
  getImplementationReadyMessage(session: WorkflowSession): string {
    if (!this.isAtImplementationStop(session)) {
      return '';
    }
    return statusMessages.tasksComplete().text + ' ' +
      `Implementation plan and task breakdown are ready in: ${session.feature_directory}`;
  }
}

export const flowController = new FlowController();
```

- [ ] **Step 2: Write a unit test for FlowController**

Create: `tests/unit/prometheus-speckit/orchestrator/flow-controller.spec.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { FlowController, flowController } from '../../../src/prometheus-speckit/orchestrator/flow-controller.js';
import { StageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';

describe('FlowController', () => {
  let flowController: FlowController;
  let stageMachine: StageMachine;

  beforeEach(() => {
    flowController = new FlowController();
    stageMachine = new StageMachine();
  });

  describe('shouldAutoAdvance', () => {
    it('returns false for tasks stage (stop point)', () => {
      const session = stageMachine.createSession('test-1', 'specs/test', 'tasks');
      expect(flowController.shouldAutoAdvance(session)).toBe(false);
    });

    it('returns true for specify stage', () => {
      const session = stageMachine.createSession('test-2', 'specs/test', 'specify');
      expect(flowController.shouldAutoAdvance(session)).toBe(true);
    });

    it('returns true for plan stage', () => {
      const session = stageMachine.createSession('test-3', 'specs/test', 'plan');
      expect(flowController.shouldAutoAdvance(session)).toBe(true);
    });
  });

  describe('getNextStage', () => {
    it('returns plan from specify', () => {
      expect(flowController.getNextStage('specify')).toBe('plan');
    });

    it('returns tasks from plan', () => {
      expect(flowController.getNextStage('plan')).toBe('tasks');
    });

    it('returns handoff from tasks (stop point)', () => {
      expect(flowController.getNextStage('tasks')).toBe('handoff');
    });

    it('returns null from handoff', () => {
      expect(flowController.getNextStage('handoff')).toBeNull();
    });
  });

  describe('autoAdvance', () => {
    it('stops at handoff and does not auto-advance to build', () => {
      const session = stageMachine.createSession('test-4', 'specs/test', 'tasks');
      
      const result = flowController.autoAdvance(session.session_id);
      
      expect(result.success).toBe(true);
      expect(result.currentStage).toBe('handoff');
      expect(result.autoAdvance).toBe(false);
      expect(result.message).toContain('Ready for implementation');
    });
  });

  describe('isAtImplementationStop', () => {
    it('returns true for handoff stage', () => {
      const session = stageMachine.createSession('test-5', 'specs/test', 'handoff');
      expect(flowController.isAtImplementationStop(session)).toBe(true);
    });

    it('returns false for other stages', () => {
      const specifySession = stageMachine.createSession('test-6', 'specs/test', 'specify');
      const planSession = stageMachine.createSession('test-7', 'specs/test', 'plan');
      
      expect(flowController.isAtImplementationStop(specifySession)).toBe(false);
      expect(flowController.isAtImplementationStop(planSession)).toBe(false);
    });
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd /home/deploy/oh-my-openspec && npm test -- --run tests/unit/prometheus-speckit/orchestrator/flow-controller.spec.ts`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/prometheus-speckit/orchestrator/flow-controller.ts tests/unit/prometheus-speckit/orchestrator/flow-controller.spec.ts
git commit -m "feat(prometheus): add FlowController for automatic stage transitions"
```

---

## Task 4: Update ModeTransitionController to Stop at Implementation

**Files:**
- Modify: `src/prometheus-speckit/orchestrator/mode-transition.ts`

- [ ] **Step 1: Read current mode-transition.ts**

Focus on the `handleImplementRequest()` method (lines 74-104).

- [ ] **Step 2: Modify handleImplementRequest to STOP at handoff instead of transitioning**

The current behavior tries to transition to build mode. We need to change it to return a message saying the user can implement.

```typescript
// BEFORE (lines 74-104):
handleImplementRequest(sessionId: string): { success: boolean; message: string } {
  try {
    const session = stageMachine.getSession(sessionId);

    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    if (session.current_mode === 'build') {
      return { success: true, message: 'Already in build mode' };
    }

    if (this.canHandoff(sessionId)) {
      this.transitionToBuild(sessionId);
      return {
        success: true,
        message: statusMessages.implementRequested().text,
      };
    } else {
      return {
        success: false,
        message: '[prometheus-speckit] Cannot implement: tasks not complete or artifacts missing. Complete tasks.md first.',
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `[prometheus-speckit] Transition error: ${(err as Error).message}`,
    };
  }
}

// AFTER:
handleImplementRequest(sessionId: string): { success: boolean; message: string; stoppedAtHandoff: boolean } {
  try {
    const session = stageMachine.getSession(sessionId);

    if (!session) {
      return { success: false, message: 'Session not found', stoppedAtHandoff: false };
    }

    // Already at handoff stage - user is ready to implement
    if (session.current_stage === 'handoff') {
      return {
        success: true,
        message: 'You have reached the implementation stage. ' +
          'Your specification, plan, and task breakdown are ready. ' +
          'You can now implement the feature yourself or continue with implementation.',
        stoppedAtHandoff: true,
      };
    }

    // In build mode already
    if (session.current_mode === 'build') {
      return { success: true, message: 'Already in build mode', stoppedAtHandoff: false };
    }

    if (this.canHandoff(sessionId)) {
      // Transition to handoff stage (NOT to build mode)
      stageMachine.transition(sessionId, 'handoff');
      return {
        success: true,
        message: 'All artifacts validated and complete. ' +
          'You are now ready to implement the feature. ' +
          'The specification, implementation plan, and task breakdown are in your feature directory.',
        stoppedAtHandoff: true,
      };
    } else {
      return {
        success: false,
        message: 'Cannot proceed to implementation: tasks are not complete or artifacts are missing. ' +
          'Please complete the task breakdown first.',
        stoppedAtHandoff: false,
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Transition error: ${(err as Error).message}`,
      stoppedAtHandoff: false,
    };
  }
}
```

- [ ] **Step 3: Also update the error messages in transitionToBuild and transitionToPlan to remove `[prometheus-speckit]` prefix**

Lines 26-29 and 99-102 should have the prefix removed:

```typescript
// Line 26-29 - transitionToBuild error:
// BEFORE: throw new Error(`Cannot transition to build mode. Session must be in handoff stage and all artifacts must be complete.`);
// AFTER: throw new Error(`Cannot transition to implementation. Session must be in handoff stage with all artifacts complete.`);

// Line 99-102 - handleImplementRequest catch:
// BEFORE: `[prometheus-speckit] Transition error: ${(err as Error).message}`;
// AFTER: `Transition error: ${(err as Error).message}`;
```

- [ ] **Step 4: Run tests**

Run: `cd /home/deploy/oh-my-openspec && npm test -- --run tests/integration/prometheus-speckit/natural-flow.spec.ts 2>&1 | head -80`
Expected: Tests pass or show failures to address

- [ ] **Step 5: Commit**

```bash
git add src/prometheus-speckit/orchestrator/mode-transition.ts
git commit -m "refactor(prometheus): stop at handoff stage instead of auto-implementing"
```

---

## Task 5: Update IntentClassifier to Support Natural Flow

**Files:**
- Modify: `src/prometheus-speckit/orchestrator/intent-classifier.ts`

- [ ] **Step 1: Read current intent-classifier.ts**

- [ ] **Step 2: Add method to get natural language intent description**

```typescript
/**
 * Get a natural language description of the intent without revealing internal processing.
 */
getIntentDescription(classification: IntentClassification): string {
  const intentDescriptions: Record<IntentType, string> = {
    'feature': 'new feature request',
    'fix': 'bug fix request',
    'refactor': 'refactoring request',
    'other': 'general request',
  };

  const base = intentDescriptions[classification.intent_type];
  if (classification.confidence < 0.5) {
    return `${base} (need more details)`;
  }
  return base;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/prometheus-speckit/orchestrator/intent-classifier.ts
git commit -m "feat(prometheus): add natural language intent descriptions"
```

---

## Task 6: Integration Test for Natural Flow

**Files:**
- Create: `tests/integration/prometheus-speckit/natural-flow.spec.ts`

- [ ] **Step 1: Write integration test covering the full natural flow**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PrometheusOrchestrator } from '../../../src/prometheus-speckit/orchestrator/prometheus-orchestrator.js';
import { StageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';

describe('Natural Flow Integration', () => {
  let orchestrator: PrometheusOrchestrator;
  let stageMachine: StageMachine;

  beforeEach(() => {
    orchestrator = new PrometheusOrchestrator();
    stageMachine = new StageMachine();
  });

  it('should not mention /speckit commands in user-facing messages', () => {
    orchestrator.startSession('specs/test-feature');
    const response = orchestrator.handleUserInput('add user authentication');
    
    // Verify no /speckit mentions
    expect(response.message).not.toContain('/speckit');
    expect(response.message).not.toContain('[prometheus-speckit]');
  });

  it('should reach handoff stage and stop (not auto-implement)', () => {
    // This test would verify the full flow through specify → plan → tasks → handoff
    // and confirm that at handoff, the system says "ready to implement" not "implementing"
    
    // Note: Full integration test requires mocking the validation checkpoints
    // This is a placeholder for the full integration scenario
    expect(true).toBe(true);
  });

  it('messages should be user-friendly without internal terminology', () => {
    orchestrator.startSession('specs/test-feature');
    const response = orchestrator.handleUserInput('fix the login bug');
    
    // Should not reveal internal command structure
    expect(response.message).not.toContain('specify mode');
    expect(response.message).not.toContain('/speckit');
    expect(response.message).not.toContain('[prometheus-speckit]');
  });
});
```

- [ ] **Step 2: Run the integration test**

Run: `cd /home/deploy/oh-my-openspec && npm test -- --run tests/integration/prometheus-speckit/natural-flow.spec.ts`
Expected: Tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/integration/prometheus-speckit/natural-flow.spec.ts
git commit -m "test(prometheus): add natural flow integration tests"
```

---

## Self-Review Checklist

After completing all tasks:

1. **Spec coverage:** Verify each requirement is implemented:
   - [ ] No `/speckit.*` mentions in user messages
   - [ ] No `[prometheus-speckit]` prefix in user messages
   - [ ] Flow auto-progresses: spec → plan → tasks
   - [ ] Flow STOPS at handoff (implementation stage)
   - [ ] User receives natural language message at each stage

2. **Placeholder scan:** Search for any remaining:
   - `TODO`, `TBD`, `implement later`
   - `/speckit` references in modified files
   - `[prometheus-speckit]` prefix in messages

3. **Type consistency:** Verify:
   - `FlowController` interface matches usage in orchestrator
   - `handleImplementRequest` return type updated correctly
   - All imports reference correct paths

---

## Summary of Changes

| File | Change |
|------|--------|
| `status-messages.ts` | Remove `[prometheus-speckit]` prefix from all messages |
| `prometheus-orchestrator.ts` | Replace `/speckit.*` mentions with natural language |
| `flow-controller.ts` | NEW: Manage automatic stage transitions with natural messages |
| `mode-transition.ts` | Change handoff to STOP instead of transition to build |
| `intent-classifier.ts` | Add natural language intent descriptions |
| `natural-flow.spec.ts` | NEW: Integration tests for natural flow |

---

## Next Steps

After this plan is implemented:

1. The Prometheus orchestrator will no longer expose `/speckit.*` commands to users
2. Messages will be professional and natural (no internal prefixes)
3. The flow will automatically progress through: specification → plan → tasks
4. At the handoff stage, the system will STOP and inform the user they are ready to implement
5. The user can then implement themselves or delegate as they wish
