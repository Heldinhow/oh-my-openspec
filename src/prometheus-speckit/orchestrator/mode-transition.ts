import type { WorkflowSession } from '../core/workflow-types.js';
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
        `Cannot transition to build mode. ` +
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
}

export const modeTransitionController = new ModeTransitionController();
