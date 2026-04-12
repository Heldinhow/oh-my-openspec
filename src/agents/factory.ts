import { Agent, AgentType, AgentStatus, PROMETHEUS_PRIMARY } from './types.js';
import { BaseAgent, AgentInterface } from './agent.interface.js';
import { OrchestrationSessionManager } from '../orchestration/orchestration-session.js';
import { spawnLogger } from '../orchestration/logger.js';

export interface SubagentConfig {
  type_id: string;
  capabilities: string[];
}

export class SubagentFactory {
  private agents: Map<string, Agent> = new Map();

  constructor(private sessionManager: OrchestrationSessionManager) {}

  spawn(
    session_id: string,
    type_id: string,
    capabilities: string[],
    prometheus_id: string = PROMETHEUS_PRIMARY
  ): Agent {
    const agent: Agent = {
      agent_id: this.generateAgentId(type_id),
      agent_name: type_id,
      agent_type: AgentType.Subagent,
      capabilities,
      status: AgentStatus.Active,
      parent_id: prometheus_id,
      created_at: new Date()
    };

    this.agents.set(agent.agent_id, agent);
    this.sessionManager.addSpawnedAgent(session_id, agent.agent_id);

    spawnLogger.info(`Subagent spawned`, {
      agent_id: agent.agent_id,
      type_id,
      parent_id: prometheus_id,
      session_id
    });

    return agent;
  }

  get(agent_id: string): Agent | undefined {
    return this.agents.get(agent_id);
  }

  terminate(agent_id: string): void {
    const agent = this.agents.get(agent_id);
    if (agent) {
      agent.status = AgentStatus.Terminated;
      spawnLogger.info(`Subagent terminated`, { agent_id });
    }
  }

  setIdle(agent_id: string): void {
    const agent = this.agents.get(agent_id);
    if (agent) {
      agent.status = AgentStatus.Idle;
    }
  }

  private generateAgentId(type_id: string): string {
    return `${type_id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
