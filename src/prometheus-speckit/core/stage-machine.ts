import type { WorkflowSession, WorkflowStage, WorkflowTransition } from './workflow-types.js';
import { STAGE_TRANSITIONS } from './workflow-types.js';

export class StageMachine {
  private sessions: Map<string, WorkflowSession> = new Map();

  createSession(
    sessionId: string,
    featureDirectory: string,
    initialStage: WorkflowStage = 'specify'
  ): WorkflowSession {
    const session: WorkflowSession = {
      session_id: sessionId,
      active_agent: 'Prometheus',
      current_mode: 'plan',
      current_stage: initialStage,
      feature_directory: featureDirectory,
      status: 'active',
      started_at: new Date(),
      updated_at: new Date(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): WorkflowSession | undefined {
    return this.sessions.get(sessionId);
  }

  canTransition(sessionId: string, to: WorkflowStage): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    return this.isValidTransition(session.current_stage, to);
  }

  transition(sessionId: string, to: WorkflowStage): WorkflowSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (session.status === 'complete') {
      throw new Error(`Session ${sessionId} is already complete and cannot transition`);
    }
    if (!this.isValidTransition(session.current_stage, to)) {
      throw new Error(
        `Invalid transition from ${session.current_stage} to ${to}`
      );
    }
    session.current_stage = to;
    session.updated_at = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }

  isValidTransition(from: WorkflowStage, to: WorkflowStage): boolean {
    return STAGE_TRANSITIONS.some(
      (t) => t.from === from && t.to === to
    );
  }

  getAvailableTransitions(sessionId: string): WorkflowStage[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return STAGE_TRANSITIONS
      .filter((t) => t.from === session.current_stage)
      .map((t) => t.to);
  }

  setMode(sessionId: string, mode: 'plan' | 'build'): WorkflowSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    session.current_mode = mode;
    session.updated_at = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }

  complete(sessionId: string): WorkflowSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    session.status = 'complete';
    session.updated_at = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }
}

export const stageMachine = new StageMachine();
