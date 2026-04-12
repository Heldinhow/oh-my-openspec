import type { WorkflowMode, WorkflowStage } from '../core/workflow-types.js';

export interface StatusMessage {
  text: string;
  mode: WorkflowMode;
  stage: WorkflowStage;
}

export class StatusMessages {
  modeTransition(from: WorkflowMode, to: WorkflowMode): StatusMessage {
    return {
      text: `[prometheus-speckit] Mode transition: ${from} → ${to}`,
      mode: to,
      stage: 'build',
    };
  }

  stageTransition(from: WorkflowStage, to: WorkflowStage): StatusMessage {
    return {
      text: `[prometheus-speckit] Stage transition: ${from} → ${to}`,
      mode: 'plan',
      stage: to,
    };
  }

  specApproved(): StatusMessage {
    return {
      text: '[prometheus-speckit] Spec approved. Proceeding to plan.',
      mode: 'plan',
      stage: 'plan',
    };
  }

  gapsDetected(count: number): StatusMessage {
    return {
      text: `[prometheus-speckit] ${count} gap(s) detected in spec. Resolving before proceeding.`,
      mode: 'plan',
      stage: 'clarify',
    };
  }

  tasksComplete(): StatusMessage {
    return {
      text: '[prometheus-speckit] Tasks complete. Ready for implementation.',
      mode: 'plan',
      stage: 'handoff',
    };
  }

  implementRequested(): StatusMessage {
    return {
      text: '[prometheus-speckit] Implementation requested. Transitioning to build mode.',
      mode: 'build',
      stage: 'build',
    };
  }

  reviewDelegated(agentName: string): StatusMessage {
    return {
      text: `[prometheus-speckit] Spec review delegated to ${agentName}.`,
      mode: 'plan',
      stage: 'specify',
    };
  }

  reviewApproved(): StatusMessage {
    return {
      text: '[prometheus-speckit] Spec review approved. No gaps found.',
      mode: 'plan',
      stage: 'plan',
    };
  }

  buildModeActive(): StatusMessage {
    return {
      text: '[prometheus-speckit] Build mode active. Implementation orchestration underway.',
      mode: 'build',
      stage: 'build',
    };
  }
}

export const statusMessages = new StatusMessages();
