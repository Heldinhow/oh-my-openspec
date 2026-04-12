import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';

describe('State Machine Integration Tests (SC-004, SC-005)', () => {
  const testSessionId = 'state-machine-test';
  const testFeatureDir = 'specs/005-test-state';

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
  });

  afterEach(() => {
    stageMachine.clearSession(testSessionId);
  });

  it('SC-004: state transitions only fire on checkpoint, not artifact creation', () => {
    // Creating plan artifact does NOT trigger state change
    const sessionBefore = stageMachine.getSession(testSessionId);
    expect(sessionBefore?.current_stage).toBe('specify');

    // Transition to plan should NOT be allowed without checkpoint
    const canTransition = stageMachine.canTransition(testSessionId, 'plan');
    expect(canTransition).toBe(false);

    // State should still be specify
    const sessionAfter = stageMachine.getSession(testSessionId);
    expect(sessionAfter?.current_stage).toBe('specify');
  });

  it('SC-004: checkpoint required before state transition', () => {
    // Try to go to plan - should fail
    expect(stageMachine.canTransition(testSessionId, 'plan')).toBe(false);

    // Set spec validated checkpoint
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Now transition should work
    expect(stageMachine.canTransition(testSessionId, 'plan')).toBe(true);
  });

  it('SC-005: re-validation triggered after artifact modification', () => {
    // Setup: spec validated
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Get current hash
    const session = stageMachine.getSession(testSessionId);
    const originalHash = session?.artifacts?.spec?.hash;

    // Modify artifact (simulate by updating hash)
    stageMachine.updateArtifactHash(testSessionId, 'spec', 'new-hash-different');

    // Checkpoint should now be invalid
    const updatedSession = stageMachine.getSession(testSessionId);
    const checkpointStatus = updatedSession?.checkpoints?.SPEC_VALIDATED?.status;
    
    // Checkpoint should be marked as requiring re-validation
    expect(checkpointStatus).not.toBe('approved');
  });

  it('SC-005: modification detected within 1 workflow response', () => {
    // This tests that hash checking happens immediately
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Immediately check for modification
    const isValid = stageMachine.validateCheckpoint(testSessionId, 'SPEC_VALIDATED');
    expect(isValid).toBe(true);

    // Simulate modification
    stageMachine.updateArtifactHash(testSessionId, 'spec', 'modified-hash');

    // Should immediately detect invalidation
    const isStillValid = stageMachine.validateCheckpoint(testSessionId, 'SPEC_VALIDATED');
    expect(isStillValid).toBe(false);
  });
});
