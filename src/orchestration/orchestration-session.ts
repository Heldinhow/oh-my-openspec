import { Agent, AgentStatus } from '../agents/types.js';
import { spawnLogger } from './logger.js';

export enum SessionStatus {
  Active = 'active',
  Interrupted = 'interrupted',
  Complete = 'complete',
  Failed = 'failed'
}

export enum SessionStage {
  Specify = 'specify',
  Clarify = 'clarify',
  Plan = 'plan',
  Tasks = 'tasks',
  Build = 'build'
}

export interface OrchestrationSession {
  session_id: string;
  prometheus_id: string;
  current_stage: SessionStage;
  status: SessionStatus;
  spawned_agents: string[];
  started_at: Date;
  updated_at: Date;
}

export interface TimeoutConfig {
  maxDuration: number;
  warningThreshold: number;
}

const DEFAULT_TIMEOUT: TimeoutConfig = {
  maxDuration: 300000,
  warningThreshold: 0.8
};

export class OrchestrationSessionManager {
  private sessions: Map<string, OrchestrationSession> = new Map();
  private agentSessions: Map<string, string> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private timeoutConfigs: Map<string, TimeoutConfig> = new Map();

  create(prometheus_id: string): OrchestrationSession {
    const session: OrchestrationSession = {
      session_id: this.generateId(),
      prometheus_id,
      current_stage: SessionStage.Specify,
      status: SessionStatus.Active,
      spawned_agents: [],
      started_at: new Date(),
      updated_at: new Date()
    };
    this.sessions.set(session.session_id, session);
    this.agentSessions.set(prometheus_id, session.session_id);
    return session;
  }

  get(session_id: string): OrchestrationSession | undefined {
    return this.sessions.get(session_id);
  }

  getByPrometheus(prometheus_id: string): OrchestrationSession | undefined {
    const session_id = this.agentSessions.get(prometheus_id);
    return session_id ? this.sessions.get(session_id) : undefined;
  }

  addSpawnedAgent(session_id: string, agent_id: string): void {
    const session = this.sessions.get(session_id);
    if (session) {
      session.spawned_agents.push(agent_id);
      session.updated_at = new Date();
    }
  }

  updateStage(session_id: string, stage: SessionStage): void {
    const session = this.sessions.get(session_id);
    if (session) {
      session.current_stage = stage;
      session.updated_at = new Date();
    }
  }

  complete(session_id: string): void {
    const session = this.sessions.get(session_id);
    if (session) {
      session.status = SessionStatus.Complete;
      session.updated_at = new Date();
    }
  }

  interrupt(session_id: string): void {
    const session = this.sessions.get(session_id);
    if (session) {
      session.status = SessionStatus.Interrupted;
      session.updated_at = new Date();
    }
    this.clearTimeout(session_id);
  }

  setTimeout(session_id: string, onTimeout: () => void, customConfig?: Partial<TimeoutConfig>): void {
    const config = { ...DEFAULT_TIMEOUT, ...customConfig };
    this.timeoutConfigs.set(session_id, config);

    const warningTime = config.maxDuration * config.warningThreshold;
    const warningTimer = setTimeout(() => {
      const currentSession = this.sessions.get(session_id);
      if (currentSession && currentSession.status === SessionStatus.Active) {
        console.warn(`[TIMEOUT WARNING] Session ${session_id} approaching timeout`);
      }
    }, warningTime);

    const timeoutTimer = setTimeout(() => {
      const currentSession = this.sessions.get(session_id);
      if (currentSession && currentSession.status === SessionStatus.Active) {
        this.interrupt(session_id);
        onTimeout();
      }
    }, config.maxDuration);

    this.timeouts.set(session_id, timeoutTimer);
  }

  clearTimeout(session_id: string): void {
    const timer = this.timeouts.get(session_id);
    if (timer) {
      clearTimeout(timer);
      this.timeouts.delete(session_id);
    }
  }

  getElapsedTime(session_id: string): number {
    const session = this.sessions.get(session_id);
    if (!session) return 0;
    return Date.now() - session.started_at.getTime();
  }

  getRemainingTime(session_id: string): number {
    const config = this.timeoutConfigs.get(session_id) || DEFAULT_TIMEOUT;
    return Math.max(0, config.maxDuration - this.getElapsedTime(session_id));
  }

  handlePrometheusUnavailability(prometheus_id: string): void {
    const session_id = this.agentSessions.get(prometheus_id);
    if (!session_id) return;

    const session = this.sessions.get(session_id);
    if (!session) return;

    spawnLogger.warn('Prometheus unavailable - maintaining subagent state', {
      prometheus_id,
      session_id,
      spawned_agents: session.spawned_agents.length
    });

    for (const agent_id of session.spawned_agents) {
      spawnLogger.info('Subagent maintaining last known state', {
        agent_id,
        session_id
      });
    }

    this.interrupt(session_id);
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
