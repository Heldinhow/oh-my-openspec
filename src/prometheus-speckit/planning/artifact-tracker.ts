import type { PlanningArtifactSet } from '../core/workflow-types.js';
import { existsSync } from 'fs';
import { stageMachine } from '../core/stage-machine.js';

export class ArtifactTracker {
  private artifacts: Map<string, PlanningArtifactSet> = new Map();

  register(featureDirectory: string): void {
    const artifactSet: PlanningArtifactSet = {
      feature_directory: featureDirectory,
      spec_file: `${featureDirectory}/spec.md`,
      plan_file: `${featureDirectory}/plan.md`,
      tasks_file: `${featureDirectory}/tasks.md`,
      additional_files: [],
      artifact_status: 'in_progress',
    };
    this.artifacts.set(featureDirectory, artifactSet);
  }

  get(featureDirectory: string): PlanningArtifactSet | undefined {
    return this.artifacts.get(featureDirectory);
  }

  addAdditionalFile(featureDirectory: string, filePath: string): void {
    const artifact = this.artifacts.get(featureDirectory);
    if (!artifact) return;
    if (!artifact.additional_files.includes(filePath)) {
      artifact.additional_files.push(filePath);
    }
  }

  checkCompleteness(featureDirectory: string): boolean {
    const artifact = this.artifacts.get(featureDirectory);
    if (!artifact) return false;

    return (
      this.fileExists(artifact.spec_file) &&
      this.fileExists(artifact.plan_file) &&
      this.fileExists(artifact.tasks_file)
    );
  }

  markComplete(featureDirectory: string): void {
    const artifact = this.artifacts.get(featureDirectory);
    if (!artifact) return;
    artifact.artifact_status = 'complete';
  }

  private fileExists(path: string): boolean {
    if (!path) return false;
    return existsSync(path);
  }

  isReadyForHandoff(featureDirectory: string): boolean {
    const artifact = this.artifacts.get(featureDirectory);
    if (!artifact) return false;
    return artifact.artifact_status === 'complete' && this.checkCompleteness(featureDirectory);
  }

  recordModification(sessionId: string, artifactType: string, hash: string): void {
    // Delegating to stageMachine.updateArtifactHash which handles
    // checkpoint invalidation and validation history recording
    stageMachine.updateArtifactHash(sessionId, artifactType, hash);
  }
}

export const artifactTracker = new ArtifactTracker();
