import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import type { FeatureState } from '../../../src/prometheus-speckit/core/workflow-types.js';

describe('Validation Workflow Integration Tests (SC-001, SC-002, SC-003)', () => {
  const testFeatureDir = 'specs/002-test-validation';
  const testSessionId = 'validation-workflow-test';

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
  });

  afterEach(() => {
    stageMachine.clearSession(testSessionId);
  });

  it('SC-001: spec validated by Momus before plan generation', () => {
    // Simulate spec validation
    const session = stageMachine.getSession(testSessionId);
    expect(session?.current_stage).toBe('specify');

    // Momus validates spec
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Transition to plan should work
    stageMachine.transition(testSessionId, 'plan');
    const updatedSession = stageMachine.getSession(testSessionId);
    expect(updatedSession?.current_stage).toBe('plan');
  });

  it('SC-002: plan validated by Metis before tasks generation', () => {
    // Setup: spec validated first
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });

    // Transition to plan
    stageMachine.transition(testSessionId, 'plan');
    const session = stageMachine.getSession(testSessionId);
    expect(session?.current_stage).toBe('plan');

    // Metis validates plan
    stageMachine.updateCheckpoint(testSessionId, 'PLAN_VALIDATED', {
      status: 'approved',
      agent: 'Metis',
      timestamp: new Date(),
    });

    // Transition to tasks should work
    stageMachine.transition(testSessionId, 'tasks');
    const updatedSession = stageMachine.getSession(testSessionId);
    expect(updatedSession?.current_stage).toBe('tasks');
  });

  it('SC-003: tasks validated by Oracle before implementation', () => {
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

    // Transition through stages
    stageMachine.transition(testSessionId, 'plan');
    stageMachine.transition(testSessionId, 'tasks');

    // Oracle validates tasks
    stageMachine.updateCheckpoint(testSessionId, 'TASKS_VALIDATED', {
      status: 'approved',
      agent: 'Oracle',
      timestamp: new Date(),
    });

    // Transition to implement should work
    stageMachine.transition(testSessionId, 'implement');
    const updatedSession = stageMachine.getSession(testSessionId);
    expect(updatedSession?.current_stage).toBe('implement');
  });

  it('SC-004: sequential validation enforced - plan blocked without spec validation', () => {
    // Try to transition to plan without spec validation
    const canTransition = stageMachine.canTransition(testSessionId, 'plan');
    expect(canTransition).toBe(false);
  });

  it('SC-004: sequential validation enforced - tasks blocked without plan validation', () => {
    // Setup spec validated
    stageMachine.updateCheckpoint(testSessionId, 'SPEC_VALIDATED', {
      status: 'approved',
      agent: 'Momus',
      timestamp: new Date(),
    });
    stageMachine.transition(testSessionId, 'plan');

    // Try to transition to tasks without plan validation
    const canTransition = stageMachine.canTransition(testSessionId, 'tasks');
    expect(canTransition).toBe(false);
  });
});
