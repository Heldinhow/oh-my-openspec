import type { IntentClassification, WorkflowSession, WorkflowStage } from '../core/workflow-types.js';
import { intentClassifier } from './intent-classifier.js';
import { planningGate } from './planning-gate.js';
import { stageMachine } from '../core/stage-machine.js';
import { templateInjector } from '../core/template-injector.js';

export interface OrchestratorResponse {
  session: WorkflowSession;
  classification: IntentClassification;
  gateResult: ReturnType<typeof planningGate.evaluate>;
  injectedTemplate: string | null;
  message: string;
}

export class PrometheusOrchestrator {
  private activeSession: WorkflowSession | null = null;

  startSession(featureDirectory: string): WorkflowSession {
    const session = stageMachine.createSession(
      this.generateSessionId(),
      featureDirectory,
      'specify'
    );
    this.activeSession = session;
    return session;
  }

  handleUserInput(input: string): OrchestratorResponse {
    if (!this.activeSession) {
      throw new Error('No active session. Call startSession first.');
    }

    const classification = intentClassifier.classify(input);
    const gateResult = planningGate.evaluate(classification);

    let nextStage: WorkflowStage | null = null;
    let message = '';

    if (gateResult.allowed && gateResult.suggestedStage === 'specify') {
      nextStage = 'specify';
      message = this.buildSpecifyMessage(classification);
    } else if (gateResult.allowed && gateResult.suggestedStage === 'clarify') {
      nextStage = 'clarify';
      message = this.buildClarifyMessage(classification);
    } else {
      message = this.buildSkipMessage(classification, gateResult);
    }

    let injectedTemplate: string | null = null;
    if (nextStage && this.activeSession) {
      injectedTemplate = templateInjector.getTemplateForStage(nextStage);
    }

    return {
      session: this.activeSession,
      classification,
      gateResult,
      injectedTemplate,
      message,
    };
  }

  private buildSpecifyMessage(classification: IntentClassification): string {
    return `[prometheus-speckit] Intent classified as '${classification.intent_type}' ` +
      `(confidence: ${(classification.confidence * 100).toFixed(0)}%). ` +
      `Planning required — entering specify mode. ` +
      `Run /speckit.specify to generate the specification draft.`;
  }

  private buildClarifyMessage(classification: IntentClassification): string {
    return `[prometheus-speckit] Intent classified as '${classification.intent_type}' ` +
      `but confidence is low. ` +
      `Please clarify: what specifically needs to be planned?`;
  }

  private buildSkipMessage(
    classification: IntentClassification,
    gateResult: ReturnType<typeof planningGate.evaluate>
  ): string {
    return `[prometheus-speckit] ${gateResult.reason}. ` +
      `No planning required for this request.`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  getActiveSession(): WorkflowSession | null {
    return this.activeSession;
  }
}

export const prometheusOrchestrator = new PrometheusOrchestrator();
