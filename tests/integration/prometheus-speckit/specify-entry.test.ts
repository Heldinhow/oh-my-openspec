import { describe, it, expect, beforeEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import { templateInjector } from '../../../src/prometheus-speckit/core/template-injector.js';

describe('Specify Entry Integration Tests', () => {
  beforeEach(() => {
    stageMachine.createSession('us1-test-session', 'specs/test-feature');
  });

  it('enters specify stage on session creation', () => {
    const session = stageMachine.getSession('us1-test-session');
    expect(session?.current_stage).toBe('specify');
    expect(session?.current_mode).toBe('plan');
  });

  it('has specify template available for specify stage', () => {
    const template = templateInjector.getTemplateForStage('specify');
    expect(template).toBeDefined();
  });

  it('transitions from specify to clarify when gaps detected', () => {
    stageMachine.transition('us1-test-session', 'clarify');
    const session = stageMachine.getSession('us1-test-session');
    expect(session?.current_stage).toBe('clarify');
  });

  it('transitions from specify to plan when spec approved', () => {
    stageMachine.transition('us1-test-session', 'plan');
    const session = stageMachine.getSession('us1-test-session');
    expect(session?.current_stage).toBe('plan');
  });

  it('mode remains plan during specify stage', () => {
    const session = stageMachine.getSession('us1-test-session');
    expect(session?.current_mode).toBe('plan');
  });

  it('available transitions from specify include clarify and plan', () => {
    const available = stageMachine.getAvailableTransitions('us1-test-session');
    expect(available).toContain('clarify');
    expect(available).toContain('plan');
  });
});
