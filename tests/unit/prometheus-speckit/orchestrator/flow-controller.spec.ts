import { describe, it, expect, beforeEach } from 'vitest';
import { stageMachine } from '../../../../src/prometheus-speckit/core/stage-machine.js';
import { flowController } from '../../../../src/prometheus-speckit/orchestrator/flow-controller.js';
import type { WorkflowSession } from '../../../../src/prometheus-speckit/core/workflow-types.js';

describe('FlowController', () => {
  let session: WorkflowSession;

  beforeEach(() => {
    // Create a fresh session for each test
    session = stageMachine.createSession(
      `test-session-${Date.now()}`,
      '/test/feature',
      'specify'
    );
  });

  describe('shouldAutoAdvance', () => {
    it('returns false for tasks stage (stop point)', () => {
      session.current_stage = 'tasks';
      expect(flowController.shouldAutoAdvance(session)).toBe(false);
    });

    it('returns true for specify stage', () => {
      session.current_stage = 'specify';
      expect(flowController.shouldAutoAdvance(session)).toBe(true);
    });

    it('returns true for clarify stage', () => {
      session.current_stage = 'clarify';
      expect(flowController.shouldAutoAdvance(session)).toBe(true);
    });

    it('returns true for plan stage', () => {
      session.current_stage = 'plan';
      expect(flowController.shouldAutoAdvance(session)).toBe(true);
    });

    it('returns true for handoff stage', () => {
      session.current_stage = 'handoff';
      expect(flowController.shouldAutoAdvance(session)).toBe(true);
    });

    it('returns true for build stage', () => {
      session.current_stage = 'build';
      expect(flowController.shouldAutoAdvance(session)).toBe(true);
    });
  });

  describe('getNextStage', () => {
    it('returns plan for specify stage', () => {
      expect(flowController.getNextStage('specify')).toBe('plan');
    });

    it('returns specify for clarify stage', () => {
      expect(flowController.getNextStage('clarify')).toBe('specify');
    });

    it('returns tasks for plan stage', () => {
      expect(flowController.getNextStage('plan')).toBe('tasks');
    });

    it('returns handoff for tasks stage', () => {
      expect(flowController.getNextStage('tasks')).toBe('handoff');
    });

    it('returns null for handoff stage', () => {
      expect(flowController.getNextStage('handoff')).toBeNull();
    });

    it('returns null for build stage', () => {
      expect(flowController.getNextStage('build')).toBeNull();
    });
  });

  describe('autoAdvance', () => {
    it('advances from specify to plan when checkpoint is set', () => {
      // Set checkpoint to allow transition to plan
      stageMachine.updateCheckpoint(session.session_id, 'SPEC_VALIDATED', {
        status: 'approved',
        agent: 'Momus',
        timestamp: new Date(),
      });

      const result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(true);
      expect(result.previousStage).toBe('specify');
      expect(result.currentStage).toBe('plan');
      expect(result.autoAdvance).toBe(true);
    });

    it('advances from clarify to specify', () => {
      session.current_stage = 'clarify';
      const result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(true);
      expect(result.previousStage).toBe('clarify');
      expect(result.currentStage).toBe('specify');
    });

    it('advances from plan to tasks when checkpoint is set', () => {
      // Set checkpoint to allow transition to tasks
      stageMachine.updateCheckpoint(session.session_id, 'PLAN_VALIDATED', {
        status: 'approved',
        agent: 'Momus',
        timestamp: new Date(),
      });

      session.current_stage = 'plan';
      const result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(true);
      expect(result.previousStage).toBe('plan');
      expect(result.currentStage).toBe('tasks');
    });

    it('stops at tasks stage without transitioning to handoff', () => {
      session.current_stage = 'tasks';
      const result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(false);
      expect(result.previousStage).toBe('tasks');
      expect(result.currentStage).toBe('tasks');
      expect(result.autoAdvance).toBe(false);
      expect(result.message).toContain('implement');
    });

    it('returns failure for unknown session', () => {
      const result = flowController.autoAdvance('non-existent-session');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('returns failure when no next stage is available', () => {
      session.current_stage = 'handoff';
      const result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(false);
      expect(result.message).toContain('No automatic transition');
    });

    it('returns failure when checkpoint is missing', () => {
      // Try to advance from specify to plan without checkpoint
      const result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot transition');
    });
  });

  describe('isAtImplementationStop', () => {
    it('returns true when current_stage is handoff', () => {
      session.current_stage = 'handoff';
      expect(flowController.isAtImplementationStop(session)).toBe(true);
    });

    it('returns false when current_stage is tasks', () => {
      session.current_stage = 'tasks';
      expect(flowController.isAtImplementationStop(session)).toBe(false);
    });

    it('returns false when current_stage is plan', () => {
      session.current_stage = 'plan';
      expect(flowController.isAtImplementationStop(session)).toBe(false);
    });

    it('returns false when current_stage is specify', () => {
      session.current_stage = 'specify';
      expect(flowController.isAtImplementationStop(session)).toBe(false);
    });
  });

  describe('getImplementationReadyMessage', () => {
    it('returns natural language message at handoff stage', () => {
      session.current_stage = 'handoff';
      const message = flowController.getImplementationReadyMessage(session);
      expect(message).toContain('implement');
    });

    it('returns same message regardless of current stage', () => {
      session.current_stage = 'specify';
      const specifyMessage = flowController.getImplementationReadyMessage(session);
      session.current_stage = 'tasks';
      const tasksMessage = flowController.getImplementationReadyMessage(session);
      // Message is based on tasksComplete, which mentions implementation readiness
      expect(specifyMessage).toBe(tasksMessage);
    });
  });

  describe('full workflow progression', () => {
    it('follows specify -> plan -> tasks progression', () => {
      // Start at specify
      expect(session.current_stage).toBe('specify');

      // Set checkpoint for specify -> plan
      stageMachine.updateCheckpoint(session.session_id, 'SPEC_VALIDATED', {
        status: 'approved',
        agent: 'Momus',
        timestamp: new Date(),
      });

      // Advance to plan
      let result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(true);
      expect(result.currentStage).toBe('plan');

      // Set checkpoint for plan -> tasks
      stageMachine.updateCheckpoint(session.session_id, 'PLAN_VALIDATED', {
        status: 'approved',
        agent: 'Momus',
        timestamp: new Date(),
      });

      // Advance to tasks
      result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(true);
      expect(result.currentStage).toBe('tasks');

      // Cannot advance further automatically
      result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(false);
      expect(result.currentStage).toBe('tasks');
      expect(flowController.isAtImplementationStop(session)).toBe(false);
    });

    it('allows clarification loop: specify -> clarify -> specify -> plan', () => {
      // At specify, go to clarify
      session.current_stage = 'clarify';
      let result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(true);
      expect(result.currentStage).toBe('specify');

      // Set checkpoint for specify -> plan
      stageMachine.updateCheckpoint(session.session_id, 'SPEC_VALIDATED', {
        status: 'approved',
        agent: 'Momus',
        timestamp: new Date(),
      });

      // From specify, go to plan
      result = flowController.autoAdvance(session.session_id);
      expect(result.success).toBe(true);
      expect(result.currentStage).toBe('plan');
    });
  });
});
