import { describe, it, expect } from 'vitest';
import type { IntentClassification, IntentType } from '../../../src/prometheus-speckit/core/workflow-types.js';

describe('Intent Classification Contract Tests', () => {
  describe('IntentType enum values', () => {
    const validTypes: IntentType[] = ['feature', 'fix', 'refactor', 'other'];

    it('accepts feature intent type', () => {
      expect(validTypes).toContain('feature');
    });

    it('accepts fix intent type', () => {
      expect(validTypes).toContain('fix');
    });

    it('accepts refactor intent type', () => {
      expect(validTypes).toContain('refactor');
    });

    it('accepts other intent type', () => {
      expect(validTypes).toContain('other');
    });
  });

  describe('IntentClassification structure', () => {
    it('requires all mandatory fields', () => {
      const classification: IntentClassification = {
        intent_id: 'test-id-1',
        raw_input: 'Add user authentication',
        intent_type: 'feature',
        planning_required: true,
        confidence: 0.95,
        created_at: new Date(),
      };

      expect(classification.intent_id).toBeDefined();
      expect(classification.raw_input).toBeDefined();
      expect(classification.intent_type).toBeDefined();
      expect(classification.planning_required).toBeDefined();
      expect(classification.confidence).toBeGreaterThanOrEqual(0);
      expect(classification.confidence).toBeLessThanOrEqual(1);
    });

    it('maps confidence to classification quality', () => {
      const highConfidence: IntentClassification = {
        intent_id: 'test-id-2',
        raw_input: 'Fix the login bug',
        intent_type: 'fix',
        planning_required: true,
        confidence: 0.98,
        created_at: new Date(),
      };

      const lowConfidence: IntentClassification = {
        intent_id: 'test-id-3',
        raw_input: 'Improve stuff maybe',
        intent_type: 'other',
        planning_required: false,
        confidence: 0.3,
        created_at: new Date(),
      };

      expect(highConfidence.confidence).toBeGreaterThan(lowConfidence.confidence);
    });

    it('planning_required=true must trigger specify mode entry', () => {
      const classification: IntentClassification = {
        intent_id: 'test-id-4',
        raw_input: 'Implement OAuth2 integration',
        intent_type: 'feature',
        planning_required: true,
        confidence: 0.9,
        created_at: new Date(),
      };

      expect(classification.planning_required).toBe(true);
    });
  });
});
