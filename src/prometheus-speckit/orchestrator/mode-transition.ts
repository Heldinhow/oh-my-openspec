import type { WorkflowSession, WorkflowStage } from '../core/workflow-types.js';
import { stageMachine } from '../core/stage-machine.js';
import { artifactTracker } from '../planning/artifact-tracker.js';
import { statusMessages } from './status-messages.js';

export class ModeTransitionController {
  canHandoff(sessionId: string): boolean {
    const session = stageMachine.getSession(sessionId);
    if (!session) return false;
    if (session.current_stage !== 'handoff') return false;
    return artifactTracker.isReadyForHandoff(session.feature_directory);
  }

  transitionToBuild(sessionId: string): WorkflowSession {
    const session = stageMachine.getSession(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.current_mode === 'build') {
      throw new Error('Already in build mode');
    }

    if (!this.canHandoff(sessionId)) {
      throw new Error(
        `Cannot transition to implementation. ` +
        `Session must be in handoff stage and all artifacts must be complete.`
      );
    }

    stageMachine.setMode(sessionId, 'build');
    const updated = stageMachine.getSession(sessionId)!;

    return updated;
  }

  transitionToPlan(sessionId: string): WorkflowSession {
    const session = stageMachine.getSession(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.current_mode === 'plan') {
      return session;
    }

    stageMachine.setMode(sessionId, 'plan');
    const updated = stageMachine.getSession(sessionId)!;

    return updated;
  }

  shouldAutoTransition(
    sessionId: string,
    classification: { requiresPlanning: boolean; planningStage: WorkflowStage }
  ): { shouldTransition: boolean; targetMode: WorkflowStage | null } {
    const session = stageMachine.getSession(sessionId);
    if (!session) {
      return { shouldTransition: false, targetMode: null };
    }

    if (!classification.requiresPlanning) {
      return { shouldTransition: false, targetMode: null };
    }

    return {
      shouldTransition: true,
      targetMode: classification.planningStage,
    };
  }

  handleImplementRequest(sessionId: string): { success: boolean; message: string; stoppedAtHandoff: boolean } {
    try {
      const session = stageMachine.getSession(sessionId);

      if (!session) {
        return { success: false, message: 'Session not found', stoppedAtHandoff: false };
      }

      if (session.current_mode === 'build') {
        return { success: true, message: 'Already in build mode', stoppedAtHandoff: false };
      }

      if (this.canHandoff(sessionId)) {
        // Stop at handoff - user is ready to implement
        return {
          success: true,
          message: statusMessages.tasksComplete().text,
          stoppedAtHandoff: true,
        };
      } else {
        return {
          success: false,
          message: 'Cannot implement: tasks not complete or artifacts missing. Please complete the task breakdown first.',
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
}

export const modeTransitionController = new ModeTransitionController();
export const modeTransition = modeTransitionController;
