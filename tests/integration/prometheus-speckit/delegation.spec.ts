import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import { reviewClient } from '../../../src/prometheus-speckit/review/review-client.js';
import type { SpecReviewResult } from '../../../src/prometheus-speckit/core/workflow-types.js';

describe('Delegation Integration Tests (SC-006)', () => {
  const testSessionId = 'delegation-test';
  const testFeatureDir = 'specs/004-test-delegation';

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
  });

  afterEach(() => {
    stageMachine.clearSession(testSessionId);
  });

  it('SC-006: delegation to Momus logs agent response', () => {
    // Simulate Momus review result
    const momusReview: SpecReviewResult = {
      review_id: 'momus-rev-001',
      session_id: testSessionId,
      review_agent: 'Momus',
      approved: true,
      gaps: [],
      recommendations: ['Consider adding more edge cases'],
      reviewed_at: new Date(),
    };

    // Review should be logged
    const logged = reviewClient.logReviewResult(momusReview);
    expect(logged).toBe(true);

    // Get session to verify log
    const session = stageMachine.getSession(testSessionId);
    expect(session?.validationHistory).toBeDefined();
  });

  it('SC-006: delegation to Metis logs agent response', () => {
    // Simulate Metis analysis result
    const metisReview = {
      review_id: 'metis-rev-001',
      session_id: testSessionId,
      review_agent: 'Metis',
      approved: true,
      gaps: [],
      assumptions: ['Users have email access'],
      reviewed_at: new Date(),
    };

    const logged = reviewClient.logReviewResult(metisReview);
    expect(logged).toBe(true);
  });

  it('SC-006: delegation to Oracle logs agent response', () => {
    // Simulate Oracle validation result
    const oracleReview = {
      review_id: 'oracle-rev-001',
      session_id: testSessionId,
      review_agent: 'Oracle',
      approved: true,
      gaps: [],
      taskAnalysis: {
        totalTasks: 25,
        byPhase: { Phase1: 3, Phase2: 5, US1: 10, US2: 7 },
        parallelOpportunities: 8,
      },
      reviewed_at: new Date(),
    };

    const logged = reviewClient.logReviewResult(oracleReview);
    expect(logged).toBe(true);
  });

  it('SC-006: feedback incorporated into artifact updates before re-validation', () => {
    // Simulate rejection with gaps
    const rejectedReview: SpecReviewResult = {
      review_id: 'momus-rev-002',
      session_id: testSessionId,
      review_agent: 'Momus',
      approved: false,
      gaps: ['Missing acceptance criteria for FR-004', 'Edge case not defined'],
      reviewed_at: new Date(),
    };

    // Log the rejection
    reviewClient.logReviewResult(rejectedReview);

    // Verify gaps are recorded
    const session = stageMachine.getSession(testSessionId);
    expect(session?.currentGaps).toContain('Missing acceptance criteria for FR-004');
    expect(session?.currentGaps).toContain('Edge case not defined');
  });
});
