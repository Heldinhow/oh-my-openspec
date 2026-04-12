import type { SpecReviewResult } from '../core/workflow-types.js';

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
}

export const gapReconciliation = new GapReconciliation();
