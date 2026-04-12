import { AgentType, PROMETHEUS_PRIMARY } from '../agents/types.js';
import { SpawnRequest, SpawnRequestManager, SpawnStatus } from './spawn-request.js';
import { ViolationTracker, ViolationType } from './violation-tracker.js';
import { SubagentRegistry } from '../agents/registry.js';
import { spawnLogger } from './logger.js';

export interface AuthorizationResult {
  authorized: boolean;
  reason: string | null;
  request: SpawnRequest;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000
};

export class SpawnAuthorizer {
  constructor(
    private spawnRequestManager: SpawnRequestManager,
    private violationTracker: ViolationTracker,
    private subagentRegistry: SubagentRegistry
  ) {}

  authorize(
    session_id: string,
    requestor_id: string,
    requestor_type: AgentType,
    target_type: string,
    task_assignment: Record<string, unknown> | null = null
  ): AuthorizationResult {
    const request = this.spawnRequestManager.create(
      session_id,
      requestor_id,
      requestor_type,
      target_type,
      task_assignment
    );

    if (requestor_type !== AgentType.Primary) {
      const reason = `Subagent ${requestor_id} attempted to spawn ${target_type}. Only primary agents can spawn.`;
      this.spawnRequestManager.deny(request.request_id, reason);
      this.violationTracker.record({
        session_id,
        violator_id: requestor_id,
        violation_type: ViolationType.SubagentSpawnPrimary,
        details: `Attempted to spawn ${target_type}`,
        notified_prometheus_id: this.findPrometheusForSession(session_id)
      });
      return { authorized: false, reason, request };
    }

    if (!this.subagentRegistry.exists(target_type)) {
      const suggestions = this.subagentRegistry.getSuggestedTypes(target_type);
      const reason = `Unknown subagent type: ${target_type}. Suggestions: ${suggestions.join(', ') || 'none'}`;
      this.spawnRequestManager.deny(request.request_id, reason);
      return { authorized: false, reason, request };
    }

    this.spawnRequestManager.approve(request.request_id);
    return { authorized: true, reason: null, request };
  }

  checkAuthorizationAtRequest(
    session_id: string,
    requestor_id: string,
    requestor_type: AgentType
  ): { authorized: boolean; message: string } {
    if (requestor_type !== AgentType.Primary) {
      const message = `Authorization denied: Only primary agents can initiate spawn requests. Requestor ${requestor_id} is type ${requestor_type}`;
      spawnLogger.warn('Unauthorized spawn attempt blocked', {
        session_id,
        requestor_id,
        requestor_type
      });
      return { authorized: false, message };
    }
    return { authorized: true, message: 'Authorized' };
  }

  notifyPrometheusOfViolation(session_id: string, violation_id: string): void {
    spawnLogger.warn('PROMETHEUS NOTIFIED: Spawn violation detected', {
      session_id,
      violation_id,
      notification_target: PROMETHEUS_PRIMARY
    });
  }

  private findPrometheusForSession(session_id: string): string {
    return PROMETHEUS_PRIMARY;
  }

  getSpawnRequest(request_id: string): SpawnRequest | undefined {
    return this.spawnRequestManager.get(request_id);
  }

  isApproved(request_id: string): boolean {
    const request = this.spawnRequestManager.get(request_id);
    return request?.status === SpawnStatus.Approved;
  }

  async retryWithBackoff(
    fn: () => AuthorizationResult,
    config: Partial<RetryConfig> = {}
  ): Promise<AuthorizationResult> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastResult: AuthorizationResult | null = null;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(
          retryConfig.baseDelayMs * Math.pow(2, attempt - 1),
          retryConfig.maxDelayMs
        );
        spawnLogger.info(`Retrying spawn after ${delay}ms`, { attempt, delay });
        await this.sleep(delay);
      }

      lastResult = fn();

      if (lastResult.authorized) {
        if (attempt > 0) {
          spawnLogger.info('Spawn authorized after retry', { attempts: attempt });
        }
        return lastResult;
      }

      if (!this.isRetryableError(lastResult.reason)) {
        spawnLogger.warn('Non-retryable error, stopping retries', { reason: lastResult.reason });
        break;
      }
    }

    return lastResult!;
  }

  private isRetryableError(reason: string | null): boolean {
    if (!reason) return false;
    const nonRetryable = ['Unknown subagent type', 'Only primary agents can spawn'];
    return !nonRetryable.some(pattern => reason.includes(pattern));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
