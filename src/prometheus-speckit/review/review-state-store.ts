import type { SpecReviewResult } from '../core/workflow-types.js';

interface ReviewCycleEntry {
  reviewId: string;
  reviewResult: SpecReviewResult;
  reconciledSpec?: string;
  resolvedAt?: Date;
}

export class ReviewStateStore {
  private cycles: Map<string, ReviewCycleEntry[]> = new Map();

  addReviewCycle(sessionId: string, result: SpecReviewResult): void {
    if (!this.cycles.has(sessionId)) {
      this.cycles.set(sessionId, []);
    }
    this.cycles.get(sessionId)!.push({
      reviewId: result.review_id,
      reviewResult: result,
    });
  }

  getCycles(sessionId: string): ReviewCycleEntry[] {
    return this.cycles.get(sessionId) || [];
  }

  markResolved(sessionId: string, reviewId: string, reconciledSpec: string): void {
    const sessionCycles = this.cycles.get(sessionId);
    if (!sessionCycles) return;
    const cycle = sessionCycles.find((c) => c.reviewId === reviewId);
    if (cycle) {
      cycle.resolvedAt = new Date();
      cycle.reconciledSpec = reconciledSpec;
    }
  }

  isApproved(sessionId: string): boolean {
    const cycles = this.getCycles(sessionId);
    if (cycles.length === 0) return false;
    const lastCycle = cycles[cycles.length - 1];
    return lastCycle.reviewResult.approved;
  }

  getLastReview(sessionId: string): SpecReviewResult | null {
    const cycles = this.getCycles(sessionId);
    if (cycles.length === 0) return null;
    return cycles[cycles.length - 1].reviewResult;
  }

  clear(sessionId: string): void {
    this.cycles.delete(sessionId);
  }
}

export const reviewStateStore = new ReviewStateStore();
