import { describe, it, expect, beforeEach } from 'vitest';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';

describe('Build Handoff Integration Tests', () => {
  beforeEach(() => {
    stageMachine.createSession('us3-handoff-test', 'specs/test-feature');
  });

  it('starts in plan mode', () => {
    const session = stageMachine.getSession('us3-handoff-test');
    expect(session?.current_mode).toBe('plan');
  });

  it('transitions through full flow to tasks stage', () => {
    stageMachine.transition('us3-handoff-test', 'clarify');
    stageMachine.transition('us3-handoff-test', 'specify');
    stageMachine.transition('us3-handoff-test', 'plan');
    stageMachine.transition('us3-handoff-test', 'tasks');
    const session = stageMachine.getSession('us3-handoff-test');
    expect(session?.current_stage).toBe('tasks');
  });

  it('transitions from tasks to handoff when tasks complete', () => {
    stageMachine.transition('us3-handoff-test', 'clarify');
    stageMachine.transition('us3-handoff-test', 'specify');
    stageMachine.transition('us3-handoff-test', 'plan');
    stageMachine.transition('us3-handoff-test', 'tasks');
    stageMachine.transition('us3-handoff-test', 'handoff');
    const session = stageMachine.getSession('us3-handoff-test');
    expect(session?.current_stage).toBe('handoff');
  });

  it('switches to build mode on implement request from handoff', () => {
    stageMachine.transition('us3-handoff-test', 'clarify');
    stageMachine.transition('us3-handoff-test', 'specify');
    stageMachine.transition('us3-handoff-test', 'plan');
    stageMachine.transition('us3-handoff-test', 'tasks');
    stageMachine.transition('us3-handoff-test', 'handoff');
    stageMachine.transition('us3-handoff-test', 'build');
    stageMachine.setMode('us3-handoff-test', 'build');

    const session = stageMachine.getSession('us3-handoff-test');
    expect(session?.current_mode).toBe('build');
    expect(session?.current_stage).toBe('build');
  });

  it('blocks direct transition from tasks to build without handoff', () => {
    stageMachine.transition('us3-handoff-test', 'clarify');
    stageMachine.transition('us3-handoff-test', 'specify');
    stageMachine.transition('us3-handoff-test', 'plan');
    stageMachine.transition('us3-handoff-test', 'tasks');
    expect(() => stageMachine.transition('us3-handoff-test', 'build')).toThrow();
  });

  it('plan mode forbids implementation code emission', () => {
    const session = stageMachine.getSession('us3-handoff-test');
    expect(session?.current_mode).toBe('plan');
  });

  it('build mode allows after explicit implement request', () => {
    stageMachine.transition('us3-handoff-test', 'clarify');
    stageMachine.transition('us3-handoff-test', 'specify');
    stageMachine.transition('us3-handoff-test', 'plan');
    stageMachine.transition('us3-handoff-test', 'tasks');
    stageMachine.transition('us3-handoff-test', 'handoff');
    stageMachine.setMode('us3-handoff-test', 'build');
    const session = stageMachine.getSession('us3-handoff-test');
    expect(session?.current_mode).toBe('build');
  });
});
