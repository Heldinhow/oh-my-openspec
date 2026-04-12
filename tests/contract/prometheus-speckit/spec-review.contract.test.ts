import { describe, it, expect } from 'vitest';
import type { SpecReviewResult, AllowedAgent } from '../../../src/prometheus-speckit/core/workflow-types.js';

describe('Spec Review Contract Tests', () => {
  describe('SpecReviewResult structure', () => {
    it('requires all mandatory fields for approved review', () => {
      const result: SpecReviewResult = {
        review_id: 'review-1',
        session_id: 'session-1',
        review_agent: 'Momus',
        approved: true,
        gaps: [],
        reviewed_at: new Date(),
      };

      expect(result.review_id).toBeDefined();
      expect(result.session_id).toBeDefined();
      expect(result.review_agent).toBeDefined();
      expect(result.approved).toBe(true);
      expect(result.gaps).toEqual([]);
    });

    it('requires gaps when approved=false', () => {
      const result: SpecReviewResult = {
        review_id: 'review-2',
        session_id: 'session-1',
        review_agent: 'Momus',
        approved: false,
        gaps: [
          'Missing acceptance criteria for user story 1',
          'No edge case defined for concurrent access',
        ],
        recommendations: ['Add explicit acceptance criteria', 'Define concurrency constraints'],
        reviewed_at: new Date(),
      };

      expect(result.approved).toBe(false);
      expect(result.gaps.length).toBeGreaterThan(0);
    });

    it('maps review_agent to allowed agents only', () => {
      const allowedAgents: AllowedAgent[] = ['Prometheus', 'Momus', 'Metis', 'Librarian', 'Oracle'];
      const result: SpecReviewResult = {
        review_id: 'review-3',
        session_id: 'session-1',
        review_agent: 'Momus',
        approved: true,
        gaps: [],
        reviewed_at: new Date(),
      };

      expect(allowedAgents).toContain(result.review_agent);
    });

    it('allows optional recommendations field', () => {
      const resultWithoutRecs: SpecReviewResult = {
        review_id: 'review-4',
        session_id: 'session-1',
        review_agent: 'Metis',
        approved: false,
        gaps: ['Missing error handling'],
        reviewed_at: new Date(),
      };

      expect(resultWithoutRecs.recommendations).toBeUndefined();
    });
  });
});
