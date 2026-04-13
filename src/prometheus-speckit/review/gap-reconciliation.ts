import type { SpecReviewResult } from '../core/workflow-types.js';
import { stageMachine } from '../core/stage-machine.js';

export interface GapReconciliationResult {
  resolved: boolean;
  remainingGaps: string[];
  updatedSpec?: string;
}

export class GapReconciliation {
  reconcile(
    reviewResult: SpecReviewResult,
    currentSpec: string
  ): GapReconciliationResult {
    if (reviewResult.approved) {
      return {
        resolved: true,
        remainingGaps: [],
      };
    }

    const gaps = reviewResult.gaps || [];
    if (gaps.length === 0) {
      return {
        resolved: false,
        remainingGaps: ['No gaps identified but review not approved'],
      };
    }

    const updatedSpec = this.applyGapsToSpec(currentSpec, gaps, reviewResult.recommendations);

    return {
      resolved: false,
      remainingGaps: gaps,
      updatedSpec,
    };
  }

  private applyGapsToSpec(
    spec: string,
    gaps: string[],
    recommendations?: string[]
  ): string {
    let updated = spec;

    if (recommendations && recommendations.length > 0) {
      updated += '\n\n## Gap Resolutions (based on review)\n\n';
      recommendations.forEach((rec, i) => {
        updated += `${i + 1}. ${rec}\n`;
      });
    }

    updated += '\n\n## Review Gaps Addressed\n\n';
    gaps.forEach((gap, i) => {
      updated += `${i + 1}. [RESOLVED] ${gap}\n`;
    });

    return updated;
  }

  hasOpenGaps(reconciliationResult: GapReconciliationResult): boolean {
    return reconciliationResult.remainingGaps.length > 0;
  }

  canRetry(sessionId: string, checkpointName: string, maxRetries: number): boolean {
    const session = stageMachine.getSession(sessionId);
    if (!session?.checkpoints?.[checkpointName]) return false;
    const retryCount = session.checkpoints[checkpointName].retry_count || 0;
    return retryCount < maxRetries;
  }

  recordRetry(sessionId: string, checkpointName: string): void {
    const session = stageMachine.getSession(sessionId);
    if (!session?.checkpoints?.[checkpointName]) return;
    const current = session.checkpoints[checkpointName].retry_count || 0;
    session.checkpoints[checkpointName].retry_count = current + 1;
  }

  shouldFail(sessionId: string, checkpointName: string, maxRetries: number): boolean {
    const session = stageMachine.getSession(sessionId);
    if (!session?.checkpoints?.[checkpointName]) return true;
    return (session.checkpoints[checkpointName].retry_count || 0) >= maxRetries;
  }

  recordUserEdit(sessionId: string, checkpointName: string): void {
    const session = stageMachine.getSession(sessionId);
    if (!session) return;
    if (session.checkpoints?.[checkpointName]) {
      // User edit should NOT reset retry_count - it should remain as it was
      if (session.checkpoints[checkpointName].status === 'approved') {
        session.checkpoints[checkpointName].status = 'pending';
      }
    }
  }
}

export const gapReconciliation = new GapReconciliation();
