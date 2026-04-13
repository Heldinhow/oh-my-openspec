import type { WorkflowMode, WorkflowStage } from '../core/workflow-types.js';

export interface StatusMessage {
  text: string;
  mode: WorkflowMode;
  stage: WorkflowStage;
}

export class StatusMessages {
  modeTransition(from: WorkflowMode, to: WorkflowMode): StatusMessage {
    return {
      text: `Workflow mode changed: ${from} → ${to}`,
      mode: to,
      stage: 'build',
    };
  }

  stageTransition(from: WorkflowStage, to: WorkflowStage): StatusMessage {
    return {
      text: `Stage transition: ${from} → ${to}`,
      mode: 'plan',
      stage: to,
    };
  }

  specApproved(): StatusMessage {
    return {
      text: 'Specification approved. Proceeding to planning phase.',
      mode: 'plan',
      stage: 'plan',
    };
  }

  gapsDetected(count: number): StatusMessage {
    return {
      text: `${count} gap(s) detected in specification. Resolving before proceeding.`,
      mode: 'plan',
      stage: 'clarify',
    };
  }

  tasksComplete(): StatusMessage {
    return {
      text: 'Tasks breakdown complete. You are ready to implement.',
      mode: 'plan',
      stage: 'handoff',
    };
  }

  implementRequested(): StatusMessage {
    return {
      text: 'Implementation requested.',
      mode: 'build',
      stage: 'build',
    };
  }

  reviewDelegated(agentName: string): StatusMessage {
    return {
      text: `Specification review delegated to ${agentName}.`,
      mode: 'plan',
      stage: 'specify',
    };
  }

  reviewApproved(): StatusMessage {
    return {
      text: 'Specification review approved. No gaps found.',
      mode: 'plan',
      stage: 'plan',
    };
  }

  buildModeActive(): StatusMessage {
    return {
      text: 'Build mode active. Implementation orchestration underway.',
      mode: 'build',
      stage: 'build',
    };
  }
}

export const CLARIFICATION_PROMPT = 'I need some clarification to proceed with your request. Could you please provide more details about what you need?';

export const statusMessages = new StatusMessages();
