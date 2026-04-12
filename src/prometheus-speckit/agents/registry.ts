import type { AgentProfile, AllowedAgent } from '../core/workflow-types.js';
import { ALLOWED_AGENTS } from '../core/workflow-types.js';

export interface AgentRole {
  name: AllowedAgent;
  role: string;
  description: string;
}

export const AGENT_ROLES: Record<AllowedAgent, AgentRole> = {
  Prometheus: {
    name: 'Prometheus',
    role: 'orchestrator',
    description: 'Primary user-facing orchestrator. Routes intent, injects templates, manages stages.',
  },
  Momus: {
    name: 'Momus',
    role: 'spec-reviewer',
    description: 'Reviews specifications for completeness and gaps.',
  },
  Metis: {
    name: 'Metis',
    role: 'researcher',
    description: 'Researches technical decisions and best practices.',
  },
  Librarian: {
    name: 'Librarian',
    role: 'context-manager',
    description: 'Manages specification context and artifact retrieval.',
  },
  Oracle: {
    name: 'Oracle',
    role: 'validator',
    description: 'Validates constraints and transition guards.',
  },
};

export class AgentRegistry {
  private profiles: Map<AllowedAgent, AgentProfile> = new Map();

  register(profile: AgentProfile): void {
    if (!this.isAllowedAgent(profile.agent_name)) {
      throw new Error(`Agent ${profile.agent_name} is not in the allowed set`);
    }
    this.profiles.set(profile.agent_name, profile);
  }

  get(agentName: AllowedAgent): AgentProfile | undefined {
    return this.profiles.get(agentName);
  }

  getAll(): AgentProfile[] {
    return Array.from(this.profiles.values());
  }

  getEnabled(): AgentProfile[] {
    return this.getAll().filter((p) => p.enabled);
  }

  isAllowedAgent(name: string): name is AllowedAgent {
    return ALLOWED_AGENTS.includes(name as AllowedAgent);
  }

  getRole(name: AllowedAgent): AgentRole | undefined {
    return AGENT_ROLES[name];
  }
}

export const agentRegistry = new AgentRegistry();
