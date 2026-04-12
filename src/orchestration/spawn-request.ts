import { AgentType } from '../agents/types.js';

export enum SpawnStatus {
  Pending = 'pending',
  Approved = 'approved',
  Denied = 'denied',
  Fulfilled = 'fulfilled',
  Failed = 'failed'
}

export interface SpawnRequest {
  request_id: string;
  session_id: string;
  requestor_id: string;
  requestor_type: AgentType;
  target_type: string;
  task_assignment: Record<string, unknown> | null;
  status: SpawnStatus;
  denial_reason: string | null;
  created_at: Date;
}

export class SpawnRequestManager {
  private requests: Map<string, SpawnRequest> = new Map();

  create(
    session_id: string,
    requestor_id: string,
    requestor_type: AgentType,
    target_type: string,
    task_assignment: Record<string, unknown> | null = null
  ): SpawnRequest {
    const request: SpawnRequest = {
      request_id: this.generateId(),
      session_id,
      requestor_id,
      requestor_type,
      target_type,
      task_assignment,
      status: SpawnStatus.Pending,
      denial_reason: null,
      created_at: new Date()
    };
    this.requests.set(request.request_id, request);
    return request;
  }

  approve(request_id: string): void {
    const request = this.requests.get(request_id);
    if (request) {
      request.status = SpawnStatus.Approved;
    }
  }

  deny(request_id: string, reason: string): void {
    const request = this.requests.get(request_id);
    if (request) {
      request.status = SpawnStatus.Denied;
      request.denial_reason = reason;
    }
  }

  fulfill(request_id: string): void {
    const request = this.requests.get(request_id);
    if (request) {
      request.status = SpawnStatus.Fulfilled;
    }
  }

  fail(request_id: string): void {
    const request = this.requests.get(request_id);
    if (request) {
      request.status = SpawnStatus.Failed;
    }
  }

  get(request_id: string): SpawnRequest | undefined {
    return this.requests.get(request_id);
  }

  getBySession(session_id: string): SpawnRequest[] {
    return Array.from(this.requests.values()).filter(r => r.session_id === session_id);
  }

  private generateId(): string {
    return `spawn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
