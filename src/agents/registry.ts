export interface SubagentType {
  type_id: string;
  name: string;
  capabilities: string[];
  version: string;
}

export interface SubagentRegistryEntry {
  registry_id: string;
  subagent_types: SubagentType[];
  version: string;
  updated_at: Date;
}

const DEFAULT_REGISTRY: SubagentType[] = [
  { type_id: 'metis', name: 'Metis', capabilities: ['analysis', 'gap-detection'], version: '1.0.0' },
  { type_id: 'momus', name: 'Momus', capabilities: ['review', 'spec-validation'], version: '1.0.0' },
  { type_id: 'librarian', name: 'Librarian', capabilities: ['retrieval', 'context'], version: '1.0.0' },
  { type_id: 'oracle', name: 'Oracle', capabilities: ['task-validation', 'architecture'], version: '1.0.0' }
];

export class SubagentRegistry {
  private registry: Map<string, SubagentType> = new Map();
  private registryMeta: SubagentRegistryEntry;

  constructor() {
    this.registryMeta = {
      registry_id: this.generateId(),
      subagent_types: [],
      version: '1.0.0',
      updated_at: new Date()
    };
    this.loadDefaults();
  }

  private loadDefaults(): void {
    for (const type of DEFAULT_REGISTRY) {
      this.register(type);
    }
  }

  register(type: SubagentType): void {
    this.registry.set(type.type_id, type);
    this.registryMeta.subagent_types = Array.from(this.registry.values());
    this.registryMeta.updated_at = new Date();
  }

  get(type_id: string): SubagentType | undefined {
    return this.registry.get(type_id);
  }

  getAll(): SubagentType[] {
    return Array.from(this.registry.values());
  }

  exists(type_id: string): boolean {
    return this.registry.has(type_id);
  }

  getSuggestedTypes(requestedType: string): string[] {
    const all = this.getAll();
    const suggestions: string[] = [];
    for (const type of all) {
      if (type.name.toLowerCase().includes(requestedType.toLowerCase()) ||
          type.type_id.toLowerCase().includes(requestedType.toLowerCase())) {
        suggestions.push(type.type_id);
      }
    }
    return suggestions;
  }

  private generateId(): string {
    return `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
