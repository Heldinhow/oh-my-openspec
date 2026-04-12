import { describe, it, expect, beforeEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import { modelConfigLoader } from '../../../src/prometheus-speckit/config/model-config.js';
import { resolve } from 'path';

describe('Foundation Integration Tests', () => {
  const testConfigPath = resolve('.config/opencode/agents.models.jsonc');

  beforeEach(() => {
    stageMachine.createSession('test-session', 'specs/test-feature');
  });

  describe('Stage Machine', () => {
    it('creates a session in specify stage by default', () => {
      const session = stageMachine.getSession('test-session');
      expect(session?.current_stage).toBe('specify');
      expect(session?.current_mode).toBe('plan');
    });

    it('transitions from specify to clarify', () => {
      const result = stageMachine.transition('test-session', 'clarify');
      expect(result.current_stage).toBe('clarify');
    });

    it('transitions from specify to plan after approval', () => {
      stageMachine.transition('test-session', 'plan');
      const session = stageMachine.getSession('test-session');
      expect(session?.current_stage).toBe('plan');
    });

    it('allows valid transitions only', () => {
      expect(() => stageMachine.transition('test-session', 'build')).toThrow();
    });

    it('switches mode from plan to build', () => {
      stageMachine.setMode('test-session', 'build');
      const session = stageMachine.getSession('test-session');
      expect(session?.current_mode).toBe('build');
    });
  });

  describe('Model Config Loader', () => {
    it('loads agent model configuration', () => {
      const cfg = modelConfigLoader.load(testConfigPath);
      expect(cfg.agents).toBeDefined();
      expect(cfg.agents.Prometheus.model_provider).toBe('anthropic');
    });

    it('returns agent profile for Prometheus', () => {
      modelConfigLoader.load(testConfigPath);
      const profile = modelConfigLoader.getAgentProfile('Prometheus');
      expect(profile.agent_name).toBe('Prometheus');
      expect(profile.enabled).toBe(true);
    });

    it('throws for unknown agent', () => {
      modelConfigLoader.load(testConfigPath);
      expect(() => modelConfigLoader.getAgentProfile('Unknown' as any)).toThrow();
    });
  });
});
