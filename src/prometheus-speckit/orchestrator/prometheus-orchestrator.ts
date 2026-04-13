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
    return `Intent detected as '${classification.intent_type}' ` +
      `(confidence: ${(classification.confidence * 100).toFixed(0)}%). ` +
      `I'll create the specification for you.`;
  }

  private buildClarifyMessage(classification: IntentClassification): string {
    return `Intent detected as '${classification.intent_type}' ` +
      `but I need more details. ` +
      `Could you please clarify what specifically needs to be built?`;
  }

  private buildSkipMessage(
    classification: IntentClassification,
    gateResult: ReturnType<typeof planningGate.evaluate>
  ): string {
    return `${gateResult.reason}. ` +
      `No planning workflow needed for this request.`;
  }

  private buildSpecCreatedMessage(featureDir: string): string {
    return `Specification created successfully. ` +
      `File saved to: ${featureDir}/spec.md`;
  }

  private buildPlanCreatedMessage(featureDir: string): string {
    return `Implementation plan created successfully. ` +
      `File saved to: ${featureDir}/plan.md`;
  }

  private buildTasksCreatedMessage(featureDir: string): string {
    return `Task breakdown created successfully. ` +
      `File saved to: ${featureDir}/tasks.md`;
  }

  private buildReadyForImplementationMessage(): string {
    return `All artifacts are complete and validated. ` +
      `You are ready to implement the feature. ` +
      `The specification, plan, and task breakdown are ready in the feature directory.`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  getActiveSession(): WorkflowSession | null {
    return this.activeSession;
  }
}

export const prometheusOrchestrator = new PrometheusOrchestrator();
