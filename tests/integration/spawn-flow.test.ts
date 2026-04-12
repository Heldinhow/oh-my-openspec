import { AgentType, AgentStatus } from '../../src/agents/types';
import { SubagentRegistry } from '../../src/agents/registry';
import { SpawnRequestManager } from '../../src/orchestration/spawn-request';
import { ViolationTracker } from '../../src/orchestration/violation-tracker';
import { SpawnAuthorizer } from '../../src/orchestration/spawn-authorizer';
import { OrchestrationSessionManager } from '../../src/orchestration/orchestration-session';
import { SubagentFactory } from '../../src/agents/factory';

describe('Complete Spawn Flow Integration', () => {
  let registry: SubagentRegistry;
  let spawnRequestManager: SpawnRequestManager;
  let violationTracker: ViolationTracker;
  let authorizer: SpawnAuthorizer;
  let sessionManager: OrchestrationSessionManager;
  let factory: SubagentFactory;

  beforeEach(() => {
    registry = new SubagentRegistry();
    spawnRequestManager = new SpawnRequestManager();
    violationTracker = new ViolationTracker();
    authorizer = new SpawnAuthorizer(spawnRequestManager, violationTracker, registry);
    sessionManager = new OrchestrationSessionManager();
    factory = new SubagentFactory(sessionManager);
  });

  test('Prometheus (primary) can spawn subagent successfully', () => {
    const session = sessionManager.create('Prometheus');
    const result = authorizer.authorize(
      session.session_id,
      'Prometheus',
      AgentType.Primary,
      'metis',
      { task: 'analysis' }
    );

    expect(result.authorized).toBe(true);
    expect(result.request.status).toBe('approved');

    const agent = factory.spawn(session.session_id, 'metis', ['analysis']);
    expect(agent.agent_type).toBe(AgentType.Subagent);
    expect(agent.parent_id).toBe('Prometheus');
  });

  test('Subagent cannot spawn any agent (primary or subagent)', () => {
    const session = sessionManager.create('Prometheus');
    const subagent = factory.spawn(session.session_id, 'metis', ['analysis']);

    const result = authorizer.authorize(
      session.session_id,
      subagent.agent_id,
      AgentType.Subagent,
      'momus'
    );

    expect(result.authorized).toBe(false);
    expect(result.reason).toContain('Only primary agents can spawn');

    const violations = violationTracker.getBySession(session.session_id);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].violation_type).toBe('subagent_spawn_primary');
  });

  test('Unknown subagent type returns error with suggestions', () => {
    const session = sessionManager.create('Prometheus');
    const result = authorizer.authorize(
      session.session_id,
      'Prometheus',
      AgentType.Primary,
      'unknown-type'
    );

    expect(result.authorized).toBe(false);
    expect(result.reason).toContain('Unknown subagent type');
    expect(result.reason).toContain('Suggestions');
  });

  test('Spawn request traces back to Prometheus', () => {
    const session = sessionManager.create('Prometheus');
    const result = authorizer.authorize(
      session.session_id,
      'Prometheus',
      AgentType.Primary,
      'metis'
    );

    expect(result.request.session_id).toBe(session.session_id);
    expect(result.request.requestor_id).toBe('Prometheus');
  });
});
