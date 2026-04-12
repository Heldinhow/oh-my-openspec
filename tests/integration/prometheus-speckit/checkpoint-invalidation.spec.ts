import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import { artifactTracker } from '../../../src/prometheus-speckit/planning/artifact-tracker.js';

describe('Checkpoint Invalidation Integration Tests (SC-005)', () => {
  const testSessionId = 'invalidation-test';
  const testFeatureDir = 'specs/007-test-invalidation';

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
  });

  afterEach(() => {
    stageMachine.clearSession(testSessionId);
  });

  it('SC-005: artifact modification invalidates checkpoint', () => {
    // Setup: spec validated
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Track original hash
    const session = stageMachine.getSession(testSessionId);
    const originalHash = session?.artifacts?.spec?.hash;

    // Modify artifact
    artifactTracker.recordModification(testSessionId, 'spec', 'modified-content-hash');

    // Checkpoint should be invalidated
    const updatedSession = stageMachine.getSession(testSessionId);
    expect(updatedSession?.checkpoints?.SPEC_VALIDATED?.status).not.toBe('approved');
  });

  it('SC-005: modification triggers re-validation requirement', () => {
    // Setup: spec validated
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Modify artifact
    artifactTracker.recordModification(testSessionId, 'spec', 'new-hash');

    // Re-validation should be required
    const session = stageMachine.getSession(testSessionId);
    expect(session?.requiresReValidation).toBe(true);
    expect(session?.reValidationFor).toContain('SPEC_VALIDATED');
  });

  it('SC-005: validation history records invalidation reason', () => {
    // Setup: spec validated
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Modify artifact
    artifactTracker.recordModification(testSessionId, 'spec', 'modified-hash');

    // Check validation history
    const session = stageMachine.getSession(testSessionId);
    const history = session?.artifacts?.spec?.validation_history || [];
    
    // Should have entry for invalidation
    const invalidationEntry = history.find(
      (entry: any) => entry.result === 'invalidated'
    );
    expect(invalidationEntry).toBeDefined();
    expect(invalidationEntry.reason).toBe('artifact_modified');
  });

  it('SC-005: plan modification invalidates PLAN_VALIDATED', () => {
    // Setup: spec and plan validated
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });
    stageMachine.updateCheckpoint(testSessionId, 'PLAN_VALIDATED', {
      status: 'approved',
      agent: 'Metis',
      timestamp: new Date(),
    });

    // Modify plan artifact
    artifactTracker.recordModification(testSessionId, 'plan', 'modified-plan-hash');

    // PLAN_VALIDATED should be invalidated
    const session = stageMachine.getSession(testSessionId);
    expect(session?.checkpoints?.PLAN_VALIDATED?.status).not.toBe('approved');
    expect(session?.checkpoints?.SPEC_VALIDATED?.status).toBe('approved'); // Spec still valid
  });
});
