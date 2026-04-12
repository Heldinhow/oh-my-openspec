import { Agent, AgentType, AgentStatus, PROMETHEUS_PRIMARY } from './types.js';
import { BaseAgent } from './agent.interface.js';
import { spawnLogger } from '../orchestration/logger.js';

export interface SubagentResult {
  agent_id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export class Subagent extends BaseAgent {
  private pendingResults: Map<string, SubagentResult> = new Map();

  constructor(agent: Agent) {
    super(agent);
    if (agent.agent_type !== AgentType.Subagent) {
      throw new Error('Subagent instance requires Subagent agent type');
    }
  }

  reportResult(result: unknown): void {
    const resultData: SubagentResult = {
      agent_id: this.agent.agent_id,
      success: true,
      data: result
    };
    this.pendingResults.set(this.agent.agent_id, resultData);
    spawnLogger.info('Subagent result reported', {
      agent_id: this.agent.agent_id,
      parent_id: this.agent.parent_id
    });
  }

  reportError(error: string): void {
    const resultData: SubagentResult = {
      agent_id: this.agent.agent_id,
      success: false,
      error
    };
    this.pendingResults.set(this.agent.agent_id, resultData);
    spawnLogger.error('Subagent reported error', {
      agent_id: this.agent.agent_id,
      error
    });
  }

  getResult(agent_id: string): SubagentResult | undefined {
    return this.pendingResults.get(agent_id);
  }

  clearResult(agent_id: string): void {
    this.pendingResults.delete(agent_id);
  }
}
