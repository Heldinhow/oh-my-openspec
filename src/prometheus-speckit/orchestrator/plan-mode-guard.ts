import type { WorkflowSession } from '../core/workflow-types.js';
import { stageMachine } from '../core/stage-machine.js';

export class PlanModeGuard {
  isPlanMode(sessionId: string): boolean {
    const session = stageMachine.getSession(sessionId);
    return session?.current_mode === 'plan';
  }

  assertPlanMode(sessionId: string): void {
    if (this.isPlanMode(sessionId)) {
      return;
    }
    throw new Error(
      '[prometheus-speckit] Plan mode guard: Cannot emit implementation code while in plan mode. ' +
      'Complete planning and request implementation to transition to build mode.'
    );
  }

  getPlanModeBlockMessage(): string {
    return '[prometheus-speckit] BLOCKED: Implementation code generation is not allowed in plan mode. ' +
      'This is the role of the build agent, not the plan orchestrator.';
  }

  isImplementAllowed(sessionId: string): boolean {
    const session = stageMachine.getSession(sessionId);
    if (!session) return false;
    return session.current_mode === 'build' && session.current_stage === 'build';
  }
}

export const planModeGuard = new PlanModeGuard();
