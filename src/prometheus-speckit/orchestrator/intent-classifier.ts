import type { IntentClassification, IntentType, WorkflowStage } from '../core/workflow-types.js';

interface ClassificationResult {
  intent: IntentType;
  planningRequired: boolean;
  confidence: number;
}

const INTENT_PATTERNS: Record<IntentType, RegExp[]> = {
  feature: [
    /add\s+(.+)/i,
    /implement\s+(.+)/i,
    /create\s+(.+)/i,
    /new\s+(.+)/i,
    /introduce\s+(.+)/i,
  ],
  fix: [
    /fix\s+(.+)/i,
    /bug\s+(.+)/i,
    /resolve\s+(.+)/i,
    /repair\s+(.+)/i,
    /patch\s+(.+)/i,
  ],
  refactor: [
    /refactor\s+(.+)/i,
    /restructure\s+(.+)/i,
    /redo\s+(.+)/i,
    /rewrite\s+(.+)/i,
    /clean\s+up\s+(.+)/i,
  ],
  other: [
    /^\s*$/,
  ],
};

const PLANNING_TRIGGERS: RegExp[] = [
  /add\s+.+\s+feature/i,
  /implement\s+/i,
  /create\s+.+\s+system/i,
  /build\s+/i,
  /design\s+/i,
  /architecture/i,
  /oauth/i,
  /auth/i,
  /integration/i,
  /api/i,
];

const NO_PLANNING_TRIGGERS: RegExp[] = [
  /typo/i,
  /fix\s+typo/i,
  /small\s+fix/i,
  /cosmetic/i,
  /rename\s+var/i,
  /comment/i,
];

export class IntentClassifier {
  classify(input: string): IntentClassification & { requiresPlanning: boolean; planningStage: WorkflowStage } {
    const intent_type = this.detectIntentType(input);
    const planning_required = this.detectPlanningRequired(input, intent_type);
    const confidence = this.calculateConfidence(input, intent_type);

    return {
      intent_id: this.generateId(),
      raw_input: input,
      intent_type,
      planning_required,
      confidence,
      created_at: new Date(),
      requiresPlanning: planning_required,
      planningStage: 'specify' as WorkflowStage,
    };
  }


  /**
   * Get a natural language description of the intent without revealing internal processing.
   */
  getIntentDescription(classification: IntentClassification): string {
    const intentDescriptions: Record<IntentType, string> = {
      'feature': 'new feature request',
      'fix': 'bug fix request',
      'refactor': 'refactoring request',
      'other': 'general request',
    };

    const base = intentDescriptions[classification.intent_type];
    if (classification.confidence < 0.5) {
      return base + ' (need more details)';
    }
    return base;
  }


  private detectIntentType(input: string): IntentType {
    for (const [type, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          return type as IntentType;
        }
      }
    }
    return 'other';
  }

  private detectPlanningRequired(input: string, intentType: IntentType): boolean {
    for (const trigger of NO_PLANNING_TRIGGERS) {
      if (trigger.test(input)) {
        return false;
      }
    }
    for (const trigger of PLANNING_TRIGGERS) {
      if (trigger.test(input)) {
        return true;
      }
    }
    return intentType !== 'other' || input.length > 50;
  }

  private calculateConfidence(input: string, intentType: IntentType): number {
    let confidence = 0.5;
    for (const pattern of INTENT_PATTERNS[intentType] || []) {
      if (pattern.test(input)) {
        confidence = Math.min(confidence + 0.3, 0.98);
      }
    }
    if (input.length > 20) confidence += 0.1;
    if (input.length > 100) confidence += 0.1;
    return Math.min(confidence, 0.99);
  }

  private generateId(): string {
    return `intent-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export const intentClassifier = new IntentClassifier();
