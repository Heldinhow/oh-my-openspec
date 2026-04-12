import type { AllowedAgent } from '../core/workflow-types.js';
import { ALLOWED_AGENTS } from '../core/workflow-types.js';

export class AgentGuard {
  validateAgent(name: string): name is AllowedAgent {
    return ALLOWED_AGENTS.includes(name as AllowedAgent);
  }

  assertAgent(name: string): AllowedAgent {
    if (!this.validateAgent(name)) {
      throw new Error(
        `Agent '${name}' is not in the allowed set. ` +
        `Allowed agents: ${ALLOWED_AGENTS.join(', ')}`
      );
    }
    return name as AllowedAgent;
  }

  getAllowedAgents(): AllowedAgent[] {
    return [...ALLOWED_AGENTS];
  }

  isAllowed(name: string): boolean {
    return this.validateAgent(name);
  }
}

export const agentGuard = new AgentGuard();
