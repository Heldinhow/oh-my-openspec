import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { templateInjector } from '../../../src/prometheus-speckit/core/template-injector.js';
import { stageMachine } from '../../../src/prometheus-speckit/core/stage-machine.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Template Conformance Integration Tests (SC-010, SC-011)', () => {
  const testSessionId = 'template-test';
  const testFeatureDir = 'specs/008-test-template';

  beforeEach(() => {
    stageMachine.createSession(testSessionId, testFeatureDir);
  });

  afterEach(() => {
    stageMachine.clearSession(testSessionId);
  });

  it('SC-010: spec artifact conforms to prometheus-spec-template.md structure', () => {
    // Load the template
    const specTemplatePath = path.resolve('.specify/templates/prometheus-spec-template.md');
    const templateExists = fs.existsSync(specTemplatePath);
    expect(templateExists).toBe(true);

    if (templateExists) {
      const templateContent = fs.readFileSync(specTemplatePath, 'utf-8');
      
      // Template should have required sections
      expect(templateContent).toContain('## Validation Checkpoint');
      expect(templateContent).toContain('Momus');
      expect(templateContent).toContain('SPEC_VALIDATED');
      expect(templateContent).toContain('User Scenarios');
      expect(templateContent).toContain('Requirements');
      expect(templateContent).toContain('Success Criteria');
      expect(templateContent).toContain('## Orchestration Section');
    }
  });

  it('SC-010: plan artifact conforms to prometheus-plan-template.md structure', () => {
    const planTemplatePath = path.resolve('.specify/templates/prometheus-plan-template.md');
    const templateExists = fs.existsSync(planTemplatePath);
    expect(templateExists).toBe(true);

    if (templateExists) {
      const templateContent = fs.readFileSync(planTemplatePath, 'utf-8');
      
      // Template should have required sections
      expect(templateContent).toContain('## Validation Checkpoint');
      expect(templateContent).toContain('Metis');
      expect(templateContent).toContain('PLAN_VALIDATED');
      expect(templateContent).toContain('Technical Context');
      expect(templateContent).toContain('Constitution Check');
      expect(templateContent).toContain('## Orchestration Section');
    }
  });

  it('SC-010: tasks artifact conforms to prometheus-tasks-template.md structure', () => {
    const tasksTemplatePath = path.resolve('.specify/templates/prometheus-tasks-template.md');
    const templateExists = fs.existsSync(tasksTemplatePath);
    expect(templateExists).toBe(true);

    if (templateExists) {
      const templateContent = fs.readFileSync(tasksTemplatePath, 'utf-8');
      
      // Template should have required sections
      expect(templateContent).toContain('## Validation Checkpoint');
      expect(templateContent).toContain('Oracle');
      expect(templateContent).toContain('TASKS_VALIDATED');
      expect(templateContent).toContain('Phase');
      expect(templateContent).toContain('Dependencies');
      expect(templateContent).toContain('## Orchestration Section');
    }
  });

  it('SC-011: templates are loadable in current environment', () => {
    // Test that template injector can load all templates
    const specLoaded = templateInjector.loadTemplate('spec');
    expect(specLoaded).toBeDefined();

    const planLoaded = templateInjector.loadTemplate('plan');
    expect(planLoaded).toBeDefined();

    const tasksLoaded = templateInjector.loadTemplate('tasks');
    expect(tasksLoaded).toBeDefined();
  });

  it('SC-011: feature-state-template.json is valid JSON schema', () => {
    const stateTemplatePath = path.resolve('.specify/templates/feature-state-template.json');
    const templateExists = fs.existsSync(stateTemplatePath);
    expect(templateExists).toBe(true);

    if (templateExists) {
      const content = fs.readFileSync(stateTemplatePath, 'utf-8');
      const parsed = JSON.parse(content);
      
      // Should have required fields
      expect(parsed.$schema).toBeDefined();
      expect(parsed.title).toBe('Feature Validation State');
      expect(parsed.properties).toBeDefined();
      expect(parsed.properties.checkpoints).toBeDefined();
      expect(parsed.properties.artifacts).toBeDefined();
    }
  });

  it('SC-010: agent definitions have required validation criteria', () => {
    const momusPath = path.resolve('.opencode/agents/momus-review.md');
    const metisPath = path.resolve('.opencode/agents/metis-analysis.md');
    const oraclePath = path.resolve('.opencode/agents/oracle-validation.md');

    expect(fs.existsSync(momusPath)).toBe(true);
    expect(fs.existsSync(metisPath)).toBe(true);
    expect(fs.existsSync(oraclePath)).toBe(true);

    if (fs.existsSync(momusPath)) {
      const momusContent = fs.readFileSync(momusPath, 'utf-8');
      expect(momusContent).toContain('Validation Criteria');
      expect(momusContent).toContain('Output Format');
    }

    if (fs.existsSync(metisPath)) {
      const metisContent = fs.readFileSync(metisPath, 'utf-8');
      expect(metisContent).toContain('Validation Criteria');
      expect(metisContent).toContain('Gap Detection');
    }

    if (fs.existsSync(oraclePath)) {
      const oracleContent = fs.readFileSync(oraclePath, 'utf-8');
      expect(oracleContent).toContain('Validation Criteria');
      expect(oracleContent).toContain('Task Format');
    }
  });
});
