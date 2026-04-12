import { AgentType } from '../../src/agents/types';
import { SubagentRegistry } from '../../src/agents/registry';
import { SpawnRequestManager } from '../../src/orchestration/spawn-request';
import { ViolationTracker, ViolationType } from '../../src/orchestration/violation-tracker';
import { SpawnAuthorizer } from '../../src/orchestration/spawn-authorizer';
import { OrchestrationSessionManager } from '../../src/orchestration/orchestration-session';

describe('Violation Notification Flow', () => {
  let registry: SubagentRegistry;
  let spawnRequestManager: SpawnRequestManager;
  let violationTracker: ViolationTracker;
  let authorizer: SpawnAuthorizer;
  let sessionManager: OrchestrationSessionManager;

  beforeEach(() => {
    registry = new SubagentRegistry();
    spawnRequestManager = new SpawnRequestManager();
    violationTracker = new ViolationTracker();
    authorizer = new SpawnAuthorizer(spawnRequestManager, violationTracker, registry);
    sessionManager = new OrchestrationSessionManager();
  });

  test('Subagent spawn primary is denied and violation is recorded', () => {
    const session = sessionManager.create('Prometheus');
    const subagentResult = authorizer.authorize(
      session.session_id,
      'subagent-123',
      AgentType.Subagent,
      'metis'
    );

    expect(subagentResult.authorized).toBe(false);
    expect(subagentResult.request.status).toBe('denied');

    const violations = violationTracker.getBySession(session.session_id);
    expect(violations.length).toBe(1);
    expect(violations[0].violation_type).toBe(ViolationType.SubagentSpawnPrimary);
    expect(violations[0].violator_id).toBe('subagent-123');
  });

  test('Violation notification contains required fields', () => {
    const session = sessionManager.create('Prometheus');
    authorizer.authorize(
      session.session_id,
      'rogue-agent',
      AgentType.Subagent,
      'unknown-type'
    );

    const violations = violationTracker.getBySession(session.session_id);
    const violation = violations[0];

    expect(violation.violation_id).toBeDefined();
    expect(violation.session_id).toBe(session.session_id);
    expect(violation.violator_id).toBe('rogue-agent');
    expect(violation.violation_type).toBe(ViolationType.SubagentSpawnPrimary);
    expect(violation.notified_prometheus_id).toBe('Prometheus');
    expect(violation.occurred_at).toBeInstanceOf(Date);
  });

  test('Prometheus can query violations for session', () => {
    const session = sessionManager.create('Prometheus');

    authorizer.authorize(session.session_id, 'agent-1', AgentType.Subagent, 'metis');
    authorizer.authorize(session.session_id, 'agent-2', AgentType.Subagent, 'momus');

    const violations = violationTracker.getBySession(session.session_id);
    expect(violations.length).toBe(2);
  });

  test('Multiple subagent violations are tracked independently', () => {
    const session1 = sessionManager.create('Prometheus-1');
    const session2 = sessionManager.create('Prometheus-2');

    authorizer.authorize(session1.session_id, 'agent-A', AgentType.Subagent, 'metis');
    authorizer.authorize(session2.session_id, 'agent-B', AgentType.Subagent, 'metis');

    expect(violationTracker.countBySession(session1.session_id)).toBe(1);
    expect(violationTracker.countBySession(session2.session_id)).toBe(1);
  });
});
