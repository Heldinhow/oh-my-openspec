import { describe, it, expect, beforeEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import { modelConfigLoader } from '../../../src/prometheus-speckit/config/model-config.js';
import { agentGuard } from '../../../src/prometheus-speckit/agents/agent-guard.js';
import { planModeGuard } from '../../../src/prometheus-speckit/orchestrator/plan-mode-guard.js';
import { resolve } from 'path';

describe('Edge Case Tests', () => {
  const testConfigPath = resolve('.config/opencode/agents.models.jsonc');

  beforeEach(() => {
    stageMachine.createSession('edge-case-session', 'specs/test-feature');
  });

  describe('Invalid Agent', () => {
    it('throws when asserting invalid agent name', () => {
      expect(() => agentGuard.assertAgent('InvalidAgent' as any)).toThrow();
    });

    it('isAllowed returns false for invalid agent names', () => {
      expect(agentGuard.isAllowed('UnknownAgent')).toBe(false);
    });
  });

  describe('Premature Implement Request', () => {
    it('blocks implement when session still in specify stage', () => {
      const session = stageMachine.getSession('edge-case-session');
      expect(session?.current_stage).toBe('specify');
      expect(planModeGuard.isPlanMode('edge-case-session')).toBe(true);
    });

    it('blocks plan mode guard from emitting implementation', () => {
      expect(() => planModeGuard.assertPlanMode('edge-case-session')).not.toThrow();
      expect(planModeGuard.isImplementAllowed('edge-case-session')).toBe(false);
    });
  });

  describe('Unavailable Subagent Model', () => {
    it('throws when delegating review to invalid agent', async () => {
      modelConfigLoader.load(testConfigPath);
      const disabledClient = new (await import('../../../src/prometheus-speckit/review/review-client.js')).ReviewClient();
      await expect(disabledClient.delegateReview({
        sessionId: 'test-session',
        specContent: 'test spec content',
        reviewAgent: 'UnknownAgent' as any,
      })).rejects.toThrow();
    });
  });

  describe('Invalid Stage Transitions', () => {
    it('throws on invalid stage transition', () => {
      expect(() => stageMachine.transition('edge-case-session', 'build')).toThrow();
    });

    it('throws on transition from completed session', () => {
      stageMachine.complete('edge-case-session');
      expect(() => stageMachine.transition('edge-case-session', 'clarify')).toThrow();
    });
  });

  describe('Session Not Found', () => {
    it('returns undefined for nonexistent session', () => {
      const session = stageMachine.getSession('nonexistent-session');
      expect(session).toBeUndefined();
    });

    it('isPlanMode returns false for nonexistent session', () => {
      expect(planModeGuard.isPlanMode('nonexistent-session')).toBe(false);
    });
  });
});
