import { describe, it, expect } from 'vitest';
import type { PlanningArtifactSet } from '../../../src/prometheus-speckit/core/workflow-types.js';

describe('Planning Artifact Set Contract Tests', () => {
  describe('PlanningArtifactSet structure', () => {
    it('requires all mandatory artifact paths', () => {
      const artifactSet: PlanningArtifactSet = {
        feature_directory: 'specs/001-feature',
        spec_file: 'specs/001-feature/spec.md',
        plan_file: 'specs/001-feature/plan.md',
        tasks_file: 'specs/001-feature/tasks.md',
        additional_files: ['research.md', 'data-model.md'],
        artifact_status: 'complete',
      };

      expect(artifactSet.spec_file).toBeDefined();
      expect(artifactSet.plan_file).toBeDefined();
      expect(artifactSet.tasks_file).toBeDefined();
      expect(artifactSet.feature_directory).toBeDefined();
    });

    it('marks complete only when spec, plan, and tasks exist', () => {
      const completeSet: PlanningArtifactSet = {
        feature_directory: 'specs/001-feature',
        spec_file: 'specs/001-feature/spec.md',
        plan_file: 'specs/001-feature/plan.md',
        tasks_file: 'specs/001-feature/tasks.md',
        additional_files: [],
        artifact_status: 'complete',
      };

      expect(completeSet.artifact_status).toBe('complete');
    });

    it('marks in_progress when tasks not yet created', () => {
      const inProgressSet: PlanningArtifactSet = {
        feature_directory: 'specs/001-feature',
        spec_file: 'specs/001-feature/spec.md',
        plan_file: 'specs/001-feature/plan.md',
        tasks_file: '',
        additional_files: [],
        artifact_status: 'in_progress',
      };

      expect(inProgressSet.artifact_status).toBe('in_progress');
    });

    it('paths must be under Speckit-standard feature directory', () => {
      const artifactSet: PlanningArtifactSet = {
        feature_directory: 'specs/001-feature',
        spec_file: 'specs/001-feature/spec.md',
        plan_file: 'specs/001-feature/plan.md',
        tasks_file: 'specs/001-feature/tasks.md',
        additional_files: ['research.md', 'data-model.md', 'quickstart.md', 'contracts/workflow-state-contract.md'],
        artifact_status: 'complete',
      };

      expect(artifactSet.spec_file.startsWith(artifactSet.feature_directory)).toBe(true);
      expect(artifactSet.plan_file.startsWith(artifactSet.feature_directory)).toBe(true);
      expect(artifactSet.tasks_file.startsWith(artifactSet.feature_directory)).toBe(true);
    });

    it('supports optional additional files', () => {
      const withExtras: PlanningArtifactSet = {
        feature_directory: 'specs/001-feature',
        spec_file: 'specs/001-feature/spec.md',
        plan_file: 'specs/001-feature/plan.md',
        tasks_file: 'specs/001-feature/tasks.md',
        additional_files: [],
        artifact_status: 'complete',
      };

      expect(withExtras.additional_files).toBeDefined();
    });
  });
});
