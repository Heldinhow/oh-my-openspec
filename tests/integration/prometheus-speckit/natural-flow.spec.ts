import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { intentClassifier } from '../../../src/prometheus-speckit/orchestrator/intent-classifier.js';
import { modeTransition } from '../../../src/prometheus-speckit/orchestrator/mode-transition.js';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';

describe('Natural Flow Integration Tests (SC-008, SC-009)', () => {
  const testSessionId = 'natural-flow-test';
  const testFeatureDir = 'specs/003-test-natural';

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
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
    const statusMessages = require('../../../src/prometheus-speckit/orchestrator/status-messages.js');
    
    expect(statusMessages.CLARIFICATION_PROMPT).toBeDefined();
    expect(statusMessages.CLARIFICATION_PROMPT).not.toContain('/speckit.');
    expect(statusMessages.CLARIFICATION_PROMPT).not.toContain('command');
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
});
