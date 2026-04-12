import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { AgentProfile, AllowedAgent } from '../core/workflow-types.js';
import { ALLOWED_AGENTS } from '../core/workflow-types.js';

export interface AgentModelsConfig {
  agents: Record<AllowedAgent, {
    model_provider: string;
    model_name: string;
    enabled: boolean;
  }>;
}

export class ModelConfigLoader {
  private config: AgentModelsConfig | null = null;

  load(configPath: string): AgentModelsConfig {
    const raw = readFileSync(resolve(configPath), 'utf-8');
    const stripped = this.stripComments(raw);
    const parsed = JSON.parse(stripped);
    this.validate(parsed);
    this.config = parsed;
    return this.config;
  }

  private stripComments(jsonc: string): string {
    let result = '';
    let inString = false;
    let inComment = false;
    let lineComment = false;
    let i = 0;

    while (i < jsonc.length) {
      const ch = jsonc[i];
      const nextCh = jsonc[i + 1];

      if (inComment) {
        if (lineComment && (ch === '\n' || ch === '\r')) {
          inComment = false;
          lineComment = false;
          result += ch;
        } else if (!lineComment && nextCh === '*/') {
          inComment = false;
          i += 2;
          continue;
        } else {
          i++;
          continue;
        }
      } else if (ch === '/' && nextCh === '/' && !inString) {
        inComment = true;
        lineComment = true;
        i += 2;
        continue;
      } else if (ch === '/' && nextCh === '*' && !inString) {
        inComment = true;
        i += 2;
        continue;
      } else if (ch === '"' && (i === 0 || jsonc[i - 1] !== '\\')) {
        inString = !inString;
      }

      if (!inComment) {
        result += ch;
      }
      i++;
    }

    return result;
  }

  get(): AgentModelsConfig {
    if (!this.config) {
      throw new Error('Model config not loaded. Call load() first.');
    }
    return this.config;
  }

  getAgentProfile(agentName: AllowedAgent): AgentProfile {
    if (!this.config) {
      throw new Error('Model config not loaded');
    }
    const entry = this.config.agents[agentName];
    if (!entry) {
      throw new Error(`No config for agent ${agentName}`);
    }
    return {
      agent_name: agentName,
      role: agentName,
      model_provider: entry.model_provider,
      model_name: entry.model_name,
      enabled: entry.enabled,
    };
  }

  private validate(cfg: unknown): asserts cfg is AgentModelsConfig {
    if (!cfg || typeof cfg !== 'object') {
      throw new Error('Config must be an object');
    }
    const c = cfg as Record<string, unknown>;
    if (!('agents' in c) || typeof c.agents !== 'object') {
      throw new Error('Config must have agents field');
    }
    const agents = c.agents as Record<string, unknown>;
    for (const name of ALLOWED_AGENTS) {
      if (!(name in agents)) {
        throw new Error(`Missing agent config for ${name}`);
      }
      const a = agents[name] as Record<string, unknown>;
      if (typeof a.model_provider !== 'string') {
        throw new Error(`model_provider missing for ${name}`);
      }
      if (typeof a.model_name !== 'string') {
        throw new Error(`model_name missing for ${name}`);
      }
      if (typeof a.enabled !== 'boolean') {
        throw new Error(`enabled missing for ${name}`);
      }
    }
  }
}

export const modelConfigLoader = new ModelConfigLoader();
