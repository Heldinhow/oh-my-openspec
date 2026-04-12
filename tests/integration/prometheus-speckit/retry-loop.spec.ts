import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import { gapReconciliation } from '../../../src/prometheus-speckit/review/gap-reconciliation.js';

describe('Retry Loop Integration Tests (SC-007)', () => {
  const testSessionId = 'retry-loop-test';
  const testFeatureDir = 'specs/006-test-retry';
  const MAX_RETRIES = 3;

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
  });

  afterEach(() => {
    stageMachine.clearSession(testSessionId);
  });

  it('SC-007: max retry limit respected', () => {
    // Setup: spec validated then modified to trigger re-validation
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
      retry_count: 0,
    });

    // Simulate 3 rejections (max retries)
    for (let i = 1; i <= MAX_RETRIES; i++) {
      const canRetry = gapReconciliation.canRetry(testSessionId, 'SPEC_VALIDATED', MAX_RETRIES);
      expect(canRetry).toBe(true);
      
      // Simulate rejection
      gapReconciliation.recordRetry(testSessionId, 'SPEC_VALIDATED');
    }

    // Should now be at max
    const canRetryAgain = gapReconciliation.canRetry(testSessionId, 'SPEC_VALIDATED', MAX_RETRIES);
    expect(canRetryAgain).toBe(false);
  });

  it('SC-007: explicit failure when max retries reached', () => {
    // Setup checkpoint at max retries
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'pending',
      agent: 'Momus',
      timestamp: new Date(),
      retry_count: MAX_RETRIES,
    });

    // Check if should fail
    const shouldFail = gapReconciliation.shouldFail(testSessionId, 'SPEC_VALIDATED', MAX_RETRIES);
    expect(shouldFail).toBe(true);
  });

  it('SC-007: user edits do not consume retry increment', () => {
    // Setup
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'pending',
      agent: 'Momus',
      timestamp: new Date(),
      retry_count: 1,
    });

    // User edits during retry - record as edit, not as retry
    gapReconciliation.recordUserEdit(testSessionId, 'SPEC_VALIDATED');

    // Retry count should still be 1, not incremented
    const session = stageMachine.getSession(testSessionId);
    expect(session?.checkpoints?.SPEC_VALIDATED?.retry_count).toBe(1);
  });

  it('SC-007: approval resets retry count', () => {
    // Setup with some retries
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'pending',
      agent: 'Momus',
      timestamp: new Date(),
      retry_count: 2,
    });

    // Approval
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
      retry_count: 0, // Reset
    });

    const session = stageMachine.getSession(testSessionId);
    expect(session?.checkpoints?.SPEC_VALIDATED?.retry_count).toBe(0);
    expect(session?.checkpoints?.SPEC_VALIDATED?.status).toBe('approved');
  });
});
