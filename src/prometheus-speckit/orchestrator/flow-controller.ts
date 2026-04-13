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
   * Determines if the session should automatically advance from its current stage.
   * Returns false for 'tasks' stage (the stop point where implementation begins).
   * @param session - The current workflow session
   * @returns true if auto-advance is allowed, false if at a stop point
   */
  shouldAutoAdvance(session: WorkflowSession): boolean {
    // Stop automatic progression at 'tasks' - user should implement
    if (session.current_stage === 'tasks') {
      return false;
    }
    return true;
  }

  /**
   * Gets the next stage in the workflow progression.
   * @param currentStage - The current workflow stage
   * @returns The next stage, or null if no automatic transition is defined
   */
  getNextStage(currentStage: WorkflowStage): WorkflowStage | null {
    const stageMap: Record<WorkflowStage, WorkflowStage | null> = {
      'specify': 'plan',
      'clarify': 'specify',
      'plan': 'tasks',
      'tasks': 'handoff',
      'handoff': null,
      'build': null,
    };
    return stageMap[currentStage] ?? null;
  }

  /**
   * Executes automatic stage transition if allowed.
   * STOPS at 'tasks' stage - does not auto-transition to 'handoff'.
   * @param sessionId - The session ID to advance
   * @returns FlowTransitionResult indicating success/failure and transition details
   */
  autoAdvance(sessionId: string): FlowTransitionResult {
    const session = stageMachine.getSession(sessionId);
    if (!session) {
      return {
        success: false,
        previousStage: 'specify',
        currentStage: 'specify',
        message: `Session ${sessionId} not found`,
        autoAdvance: false,
      };
    }

    // Check if we should auto-advance - STOP at tasks stage
    if (!this.shouldAutoAdvance(session)) {
      return {
        success: false,
        previousStage: session.current_stage,
        currentStage: session.current_stage,
        message: 'Automatic progression stopped. You can now implement.',
        autoAdvance: false,
      };
    }

    const nextStage = this.getNextStage(session.current_stage);
    if (!nextStage) {
      return {
        success: false,
        previousStage: session.current_stage,
        currentStage: session.current_stage,
        message: `No automatic transition available from ${session.current_stage}`,
        autoAdvance: false,
      };
    }

    // Check if the transition is allowed by stage machine
    if (!stageMachine.canTransition(sessionId, nextStage)) {
      return {
        success: false,
        previousStage: session.current_stage,
        currentStage: session.current_stage,
        message: `Cannot transition from ${session.current_stage} to ${nextStage}`,
        autoAdvance: false,
      };
    }

    const previousStage = session.current_stage;
    stageMachine.transition(sessionId, nextStage);

    return {
      success: true,
      previousStage,
      currentStage: nextStage,
      message: statusMessages.tasksComplete().text,
      autoAdvance: true,
    };
  }

  /**
   * Checks if the session is at the implementation stop point (handoff stage).
   * @param session - The workflow session to check
   * @returns true if at handoff stage, false otherwise
   */
  isAtImplementationStop(session: WorkflowSession): boolean {
    return session.current_stage === 'handoff';
  }

  /**
   * Returns a natural language message when the session is at handoff.
   * @param session - The workflow session
   * @returns Message indicating user can implement
   */
  getImplementationReadyMessage(session: WorkflowSession): string {
    return statusMessages.tasksComplete().text;
  }
}

export const flowController = new FlowController();
