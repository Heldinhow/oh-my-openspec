import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import type { WorkflowStage } from './workflow-types.js';

export type SpeckitCommand = 'specify' | 'clarify' | 'plan' | 'tasks' | 'implement';

const COMMAND_TEMPLATE_MAP: Partial<Record<WorkflowStage, SpeckitCommand>> = {
  specify: 'specify',
  clarify: 'clarify',
  plan: 'plan',
  tasks: 'tasks',
  handoff: 'implement',
};

export class TemplateInjector {
  private templates: Map<string, string> = new Map();
  private templateBasePath: string;

  constructor(templateBasePath: string = '.opencode/command') {
    this.templateBasePath = templateBasePath;
  }

  loadCommandTemplate(command: SpeckitCommand): string {
    const cacheKey = command;
    if (this.templates.has(cacheKey)) {
      return this.templates.get(cacheKey)!;
    }
    const path = resolve(join(this.templateBasePath, `speckit.${command}.md`));
    if (!existsSync(path)) {
      throw new Error(`Template not found: ${path}`);
    }
    const content = readFileSync(path, 'utf-8');
    this.templates.set(cacheKey, content);
    return content;
  }

  getTemplateForStage(stage: WorkflowStage): string | null {
    const command = COMMAND_TEMPLATE_MAP[stage];
    if (!command) return null;
    try {
      return this.loadCommandTemplate(command);
    } catch {
      return null;
    }
  }

  injectIntoContext(stage: WorkflowStage, context: Record<string, string>): string | null {
    const template = this.getTemplateForStage(stage);
    if (!template) return null;
    let result = template;
    for (const [key, value] of Object.entries(context)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  isCommandAllowed(command: string): command is SpeckitCommand {
    return ['specify', 'clarify', 'plan', 'tasks', 'implement'].includes(command);
  }

  loadTemplate(templateName: string): string {
    const commandMap: Record<string, SpeckitCommand> = {
      'spec': 'specify',
      'plan': 'plan',
      'tasks': 'tasks',
    };
    const command = commandMap[templateName];
    if (!command) throw new Error(`Unknown template: ${templateName}`);
    return this.loadCommandTemplate(command);
  }
}

export const templateInjector = new TemplateInjector();
