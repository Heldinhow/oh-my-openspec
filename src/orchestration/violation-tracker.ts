export enum ViolationType {
  SubagentSpawnPrimary = 'subagent_spawn_primary',
  UnauthorizedSpawn = 'unauthorized_spawn'
}

export interface SpawnViolation {
  violation_id: string;
  session_id: string;
  violator_id: string;
  violation_type: ViolationType;
  details: string | null;
  notified_prometheus_id: string;
  occurred_at: Date;
}

export interface ViolationRecord {
  session_id: string;
  violator_id: string;
  violation_type: ViolationType;
  details: string;
  notified_prometheus_id: string;
}

export class ViolationTracker {
  private violations: Map<string, SpawnViolation> = new Map();
  private sessionViolations: Map<string, string[]> = new Map();

  record(record: ViolationRecord): SpawnViolation {
    const violation: SpawnViolation = {
      violation_id: this.generateId(),
      session_id: record.session_id,
      violator_id: record.violator_id,
      violation_type: record.violation_type,
      details: record.details,
      notified_prometheus_id: record.notified_prometheus_id,
      occurred_at: new Date()
    };
    this.violations.set(violation.violation_id, violation);

    const sessionList = this.sessionViolations.get(record.session_id) || [];
    sessionList.push(violation.violation_id);
    this.sessionViolations.set(record.session_id, sessionList);

    return violation;
  }

  get(violation_id: string): SpawnViolation | undefined {
    return this.violations.get(violation_id);
  }

  getBySession(session_id: string): SpawnViolation[] {
    const ids = this.sessionViolations.get(session_id) || [];
    return ids.map(id => this.violations.get(id)).filter((v): v is SpawnViolation => v !== undefined);
  }

  getAll(): SpawnViolation[] {
    return Array.from(this.violations.values());
  }

  countBySession(session_id: string): number {
    return this.getBySession(session_id).length;
  }

  private generateId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
