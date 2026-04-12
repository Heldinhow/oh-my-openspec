export enum AgentType {
  Primary = 'primary',
  Subagent = 'subagent'
}

export enum AgentStatus {
  Active = 'active',
  Idle = 'idle',
  Terminated = 'terminated'
}

export interface Agent {
  agent_id: string;
  agent_name: string;
  agent_type: AgentType;
  capabilities: string[];
  status: AgentStatus;
  parent_id: string | null;
  created_at: Date;
}

export const PROMETHEUS_PRIMARY = 'Prometheus';
