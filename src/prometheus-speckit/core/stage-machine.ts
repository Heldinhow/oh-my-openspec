import type { WorkflowSession, WorkflowStage, WorkflowTransition, CheckpointState, AllowedAgent } from './workflow-types.js';
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

  canTransition(sessionId: string, to: WorkflowStage | 'implement'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    // 'implement' is treated as alias for 'handoff' in tests
    const normalizedTo = to === 'implement' ? 'handoff' : to;
    if (!this.isValidTransition(session.current_stage, normalizedTo)) return false;

    // Enforce checkpoint validation for stage transitions
    const checkpointMap: Record<string, string> = {
      'plan': 'SPEC_VALIDATED',
      'tasks': 'PLAN_VALIDATED',
      'handoff': 'TASKS_VALIDATED',
    };

    const requiredCheckpoint = checkpointMap[normalizedTo];
    if (requiredCheckpoint) {
      return this.validateCheckpoint(sessionId, requiredCheckpoint);
    }

    return true;
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

  isValidTransition(from: WorkflowStage, to: WorkflowStage | 'implement'): boolean {
    // 'implement' is treated as alias for 'handoff' in tests
    const normalizedTo = to === 'implement' ? 'handoff' : to;
    return STAGE_TRANSITIONS.some(
      (t) => t.from === from && t.to === normalizedTo
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

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  updateCheckpoint(
    sessionId: string,
    checkpointName: string,
    data: { status: 'approved' | 'pending' | 'invalidated'; agent: AllowedAgent; timestamp: Date; retry_count?: number }
  ): WorkflowSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (!session.checkpoints) {
      session.checkpoints = {};
    }
    session.checkpoints[checkpointName] = {
      status: data.status,
      agent: data.agent,
      timestamp: data.timestamp,
      retry_count: data.retry_count,
    };
    session.updated_at = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }

  updateArtifactHash(sessionId: string, artifactType: string, hash: string): WorkflowSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (!session.artifacts) {
      session.artifacts = {};
    }
    if (!session.artifacts[artifactType]) {
      session.artifacts[artifactType] = { hash, validation_history: [] };
    } else {
      session.artifacts[artifactType].hash = hash;
    }

    // Invalidate checkpoint when artifact hash changes
    const checkpointMap: Record<string, string> = {
      'spec': 'SPEC_VALIDATED',
      'plan': 'PLAN_VALIDATED',
      'tasks': 'TASKS_VALIDATED',
    };
    const checkpointName = checkpointMap[artifactType];
    if (checkpointName && session.checkpoints?.[checkpointName]) {
      session.checkpoints[checkpointName].status = 'invalidated';
      session.requiresReValidation = true;
      session.reValidationFor = [...new Set([...(session.reValidationFor || []), checkpointName])];

      // Record in validation history on the artifact
      if (!session.artifacts[artifactType].validation_history) {
        session.artifacts[artifactType].validation_history = [];
      }
      session.artifacts[artifactType].validation_history.push({
        result: 'invalidated',
        agent: 'Prometheus',
        timestamp: new Date(),
        reason: `artifact_modified:${artifactType}`,
      });
    }

    session.updated_at = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }

  validateCheckpoint(sessionId: string, checkpointName: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.checkpoints) return false;
    const checkpoint = session.checkpoints[checkpointName];
    if (!checkpoint) return false;
    return checkpoint.status === 'approved';
  }
}

export const stageMachine = new StageMachine();
