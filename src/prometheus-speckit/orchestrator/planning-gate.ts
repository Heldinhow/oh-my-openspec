import type { IntentClassification } from '../core/workflow-types.js';

export interface PlanningGateResult {
  allowed: boolean;
  reason: string;
  suggestedStage: 'specify' | 'clarify' | 'skip';
}

export class PlanningGate {
  evaluate(classification: IntentClassification): PlanningGateResult {
    if (!classification.planning_required) {
      return {
        allowed: false,
        reason: `Intent type '${classification.intent_type}' does not require planning`,
        suggestedStage: 'skip',
      };
    }

    if (classification.confidence < 0.4) {
      return {
        allowed: true,
        reason: 'Low confidence - clarify before specify',
        suggestedStage: 'clarify',
      };
    }

    if (classification.intent_type === 'other' && classification.confidence < 0.7) {
      return {
        allowed: true,
        reason: 'Ambiguous intent - clarify recommended',
        suggestedStage: 'clarify',
      };
    }

    return {
      allowed: true,
      reason: `Intent '${classification.intent_type}' requires planning - entering specify`,
      suggestedStage: 'specify',
    };
  }
}

export const planningGate = new PlanningGate();
