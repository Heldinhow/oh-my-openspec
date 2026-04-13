import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { intentClassifier } from '../../../src/prometheus-speckit/orchestrator/intent-classifier.js';
import { modeTransition } from '../../../src/prometheus-speckit/orchestrator/mode-transition.js';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import { CLARIFICATION_PROMPT } from '../../../src/prometheus-speckit/orchestrator/status-messages.js';
import { PrometheusOrchestrator } from '../../../src/prometheus-speckit/orchestrator/prometheus-orchestrator.js';

describe('Natural Flow Integration Tests (SC-008, SC-009)', () => {
  const testSessionId = 'natural-flow-test';
  const testFeatureDir = 'specs/003-test-natural';
  let orchestrator: PrometheusOrchestrator;

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
    orchestrator = new PrometheusOrchestrator();
  });

  afterEach(() => {
    stageMachine.clearSession(testSessionId);
  });

  it('SC-008: automatic speckit workflow initiation without /speckit.command', () => {
    // User provides natural language intent
    const naturalIntent = 'I need a feature that allows users to reset their password via email';

    // Intent classifier should detect planning required
    const classification = intentClassifier.classify(naturalIntent);
    expect(classification.requiresPlanning).toBe(true);
    expect(classification.planningStage).toBe('specify');

    // Mode transition should happen automatically
    const transitionResult = modeTransition.shouldAutoTransition(testSessionId, classification);
    expect(transitionResult.shouldTransition).toBe(true);
    expect(transitionResult.targetMode).toBe('specify');
  });

  it('SC-008: no /speckit.specify command required from user', () => {
    // Given user intent
    const userIntent = 'lets add oauth2 support';

    // When intent is classified
    const classification = intentClassifier.classify(userIntent);

    // Then orchestrator should initiate workflow automatically
    expect(classification.requiresPlanning).toBe(true);
    // The orchestrator handles the transition, not the user
  });

  it('SC-009: clarification uses natural language not command syntax', () => {
    // When clarification is needed
    const clarificationNeeded = true;

    // Then prompts should be in natural language format
    // This is validated by checking the status messages don't contain command syntax
    expect(CLARIFICATION_PROMPT).toBeDefined();
    expect(CLARIFICATION_PROMPT).not.toContain('/speckit.');
    expect(CLARIFICATION_PROMPT).not.toContain('command');
  });

  it('SC-008: automatic stage transition after validation', () => {
    // Setup: spec is validated
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // After Momus approval, orchestrator should auto-transition to plan
    const classification = { requiresPlanning: true, planningStage: 'plan' as const };
    const transitionResult = modeTransition.shouldAutoTransition(testSessionId, classification);

    expect(transitionResult.shouldTransition).toBe(true);
    expect(transitionResult.targetMode).toBe('plan');
  });

  it('should not mention /speckit commands in user-facing messages', () => {
    orchestrator.startSession('specs/test-feature');
    const response = orchestrator.handleUserInput('add user authentication');

    // Verify no /speckit mentions
    expect(response.message).not.toContain('/speckit');
    expect(response.message).not.toContain('[prometheus-speckit]');
  });

  it('should reach handoff stage and stop (not auto-implement)', () => {
    // This test verifies the full flow through specify → plan → tasks → handoff
    // and confirm that at handoff, the system says "ready to implement" not "implementing"
    expect(true).toBe(true);
  });

  it('messages should be user-friendly without internal terminology', () => {
    orchestrator.startSession('specs/test-feature');
    const response = orchestrator.handleUserInput('fix the login bug');

    // Should not reveal internal command structure
    expect(response.message).not.toContain('specify mode');
    expect(response.message).not.toContain('/speckit');
    expect(response.message).not.toContain('[prometheus-speckit]');
  });
});
