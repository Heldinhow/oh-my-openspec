import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import yaml from 'yaml';

export interface HookDefinition {
  extension: string;
  command: string;
  enabled: boolean;
  optional: boolean;
  prompt: string;
  description: string;
  condition?: string;
}

export interface HooksConfig {
  installed: unknown[];
  settings: {
    auto_execute_hooks: boolean;
  };
  hooks: Record<string, HookDefinition[]>;
}

export class HookResolver {
  private config: HooksConfig | null = null;
  private configPath: string;

  constructor(configPath: string = '.specify/extensions.yml') {
    this.configPath = configPath;
  }

  load(): HooksConfig {
    if (this.config) return this.config;
    const path = resolve(this.configPath);
    if (!existsSync(path)) {
      throw new Error(`Hook config not found: ${path}`);
    }
    const raw = readFileSync(path, 'utf-8');
    this.config = yaml.parse(raw) as HooksConfig;
    return this.config;
  }

  getHooksForPhase(phase: string): HookDefinition[] {
    const cfg = this.load();
    const key = `hooks.${phase}` as keyof HooksConfig;
    const hooks = (cfg as unknown as Record<string, unknown>)[key];
    if (!Array.isArray(hooks)) return [];
    return (hooks as HookDefinition[]).filter((h) => h.enabled !== false);
  }

  getBeforeHooks(phase: string): HookDefinition[] {
    return this.getHooksForPhase(`before_${phase}`);
  }

  getAfterHooks(phase: string): HookDefinition[] {
    return this.getHooksForPhase(`after_${phase}`);
  }

  isExecutable(hook: HookDefinition): boolean {
    return hook.enabled !== false && !hook.condition;
  }
}

export const hookResolver = new HookResolver();
