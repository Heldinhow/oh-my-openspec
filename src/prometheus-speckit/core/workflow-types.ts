export type IntentType = 'feature' | 'fix' | 'refactor' | 'other';

export type WorkflowStage =
  | 'specify'
  | 'clarify'
  | 'plan'
  | 'tasks'
  | 'handoff'
  | 'build';

export type WorkflowMode = 'plan' | 'build';

export type WorkflowStatus = 'active' | 'blocked' | 'complete';

export interface IntentClassification {
  intent_id: string;
  raw_input: string;
  intent_type: IntentType;
  planning_required: boolean;
  confidence: number;
  created_at: Date;
}

export interface WorkflowSession {
  session_id: string;
  active_agent: AllowedAgent;
  current_mode: WorkflowMode;
  current_stage: WorkflowStage;
  feature_directory: string;
  status: WorkflowStatus;
  started_at: Date;
  updated_at: Date;
}

export type AllowedAgent = 'Prometheus' | 'Momus' | 'Metis' | 'Librarian' | 'Oracle';

export interface AgentProfile {
  agent_name: AllowedAgent;
  role: string;
  model_provider: string;
  model_name: string;
  enabled: boolean;
}

export interface SpecReviewResult {
  review_id: string;
  session_id: string;
  review_agent: AllowedAgent;
  approved: boolean;
  gaps: string[];
  recommendations?: string[];
  reviewed_at: Date;
}

export interface PlanningArtifactSet {
  feature_directory: string;
  spec_file: string;
  plan_file: string;
  tasks_file: string;
  additional_files: string[];
  artifact_status: 'in_progress' | 'complete';
}

export interface WorkflowTransition {
  from: WorkflowStage;
  to: WorkflowStage;
  trigger: string;
  guard?: (session: WorkflowSession) => boolean;
}

export const ALLOWED_AGENTS: AllowedAgent[] = [
  'Prometheus',
  'Momus',
  'Metis',
  'Librarian',
  'Oracle',
];

export const STAGE_TRANSITIONS: WorkflowTransition[] = [
  { from: 'specify', to: 'clarify', trigger: 'gap_detected' },
  { from: 'specify', to: 'plan', trigger: 'spec_approved' },
  { from: 'clarify', to: 'specify', trigger: 'clarification_complete' },
  { from: 'plan', to: 'tasks', trigger: 'planning_complete' },
  { from: 'tasks', to: 'handoff', trigger: 'tasks_complete' },
  { from: 'handoff', to: 'build', trigger: 'implement_requested' },
  { from: 'build', to: 'plan', trigger: 'planning_requested' },
];
