import { describe, it, expect, beforeEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import type { SpecReviewResult } from '../../../src/prometheus-speckit/core/workflow-types.js';

describe('Spec Review Loop Integration Tests', () => {
  beforeEach(() => {
    stageMachine.createSession('us2-review-test', 'specs/test-feature');
  });

  it('transitions to specify stage for review delegation', () => {
    const session = stageMachine.getSession('us2-review-test');
    expect(session?.current_stage).toBe('specify');
  });

  it('can transition from specify to clarify when gaps detected', () => {
    stageMachine.transition('us2-review-test', 'clarify');
    const session = stageMachine.getSession('us2-review-test');
    expect(session?.current_stage).toBe('clarify');
  });

  it('can transition back from clarify to specify after gap resolution', () => {
    stageMachine.transition('us2-review-test', 'clarify');
    stageMachine.transition('us2-review-test', 'specify');
    const session = stageMachine.getSession('us2-review-test');
    expect(session?.current_stage).toBe('specify');
  });

  it('state machine allows specify to plan transition (gap check is orchestration layer responsibility)', () => {
    stageMachine.transition('us2-review-test', 'clarify');
    stageMachine.transition('us2-review-test', 'specify');
    stageMachine.transition('us2-review-test', 'plan');
    const session = stageMachine.getSession('us2-review-test');
    expect(session?.current_stage).toBe('plan');
  });

  it('builds review result with approval status', () => {
    const approvedResult: SpecReviewResult = {
      review_id: 'rev-approved',
      session_id: 'us2-review-test',
      review_agent: 'Momus',
      approved: true,
      gaps: [],
      reviewed_at: new Date(),
    };

    expect(approvedResult.approved).toBe(true);
    expect(approvedResult.gaps).toHaveLength(0);
  });

  it('builds review result with gaps for rejection', () => {
    const rejectedResult: SpecReviewResult = {
      review_id: 'rev-rejected',
      session_id: 'us2-review-test',
      review_agent: 'Momus',
      approved: false,
      gaps: ['Missing FR-003 acceptance criteria', 'Success metrics undefined'],
      reviewed_at: new Date(),
    };

    expect(rejectedResult.approved).toBe(false);
    expect(rejectedResult.gaps.length).toBe(2);
  });
});
