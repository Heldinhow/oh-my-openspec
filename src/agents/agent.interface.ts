import { Agent, AgentType, AgentStatus } from './types.js';

export interface AgentInterface {
  getAgentId(): string;
  getAgentName(): string;
  getAgentType(): AgentType;
  getStatus(): AgentStatus;
  getParentId(): string | null;
  canSpawnSubagent(): boolean;
  reportResult(result: unknown): void;
}

export abstract class BaseAgent implements AgentInterface {
  protected agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  getAgentId(): string {
    return this.agent.agent_id;
  }

  getAgentName(): string {
    return this.agent.agent_name;
  }

  getAgentType(): AgentType {
    return this.agent.agent_type;
  }

  getStatus(): AgentStatus {
    return this.agent.status;
  }

  getParentId(): string | null {
    return this.agent.parent_id;
  }

  canSpawnSubagent(): boolean {
    return this.agent.agent_type === AgentType.Primary;
  }

  abstract reportResult(result: unknown): void;
}
