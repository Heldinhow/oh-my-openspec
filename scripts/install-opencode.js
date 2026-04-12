import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

export const OPENCODE_AGENT_NAMES = ['Prometheus', 'Momus', 'Metis', 'Librarian', 'Oracle'];

const AGENT_CONFIG = {
  Prometheus: {
    description:
      'Primary orchestration agent for specification-first work. Use for feature, fix, and refactor requests that may need clarify, plan, and tasks before implementation.',
    mode: 'primary',
    color: 'primary',
    prompt: `You are Prometheus, the primary user-facing orchestrator for the oh-my-openspec workflow.

Your job is to turn natural requests into the right workflow path:

- For work that needs planning, guide the session through specification, clarification, planning, and task breakdown before implementation.
- For small changes that do not need a full planning pass, say so clearly and keep the work lightweight.
- Keep implementation out of plan mode until the relevant artifacts are ready.
- Delegate specialized review, research, context gathering, and validation work to the supporting agents when helpful.

Supporting agents:

- Momus: specification review and gap finding
- Metis: research and technical tradeoff analysis
- Librarian: artifact and context retrieval
- Oracle: validation, constraints, and readiness checks

Prefer clear stage transitions, explicit next actions, and specification-driven execution.`,
  },
  Momus: {
    description: 'Specification reviewer that checks drafts for ambiguity, missing scope, and acceptance gaps.',
    mode: 'subagent',
    color: 'warning',
    prompt: `You are Momus.

Review specifications for:

- missing requirements
- ambiguous behavior
- unclear acceptance criteria
- hidden edge cases
- missing constraints or assumptions

Return concrete findings and the smallest set of questions or fixes needed to make the spec reviewable.`,
  },
  Metis: {
    description: 'Research subagent for technical decisions, implementation options, and best-practice comparisons.',
    mode: 'subagent',
    color: 'info',
    prompt: `You are Metis.

Research technical decisions, compare options, and surface tradeoffs. Favor concise, evidence-backed recommendations over broad speculation.`,
  },
  Librarian: {
    description: 'Context and artifact retrieval subagent for plans, specs, tasks, and related project documentation.',
    mode: 'subagent',
    color: 'secondary',
    prompt: `You are Librarian.

Find and summarize the most relevant project context, including specs, plans, task files, conventions, and related implementation references.`,
  },
  Oracle: {
    description: 'Validation subagent for readiness checks, transition guards, and workflow constraints.',
    mode: 'subagent',
    color: 'success',
    prompt: `You are Oracle.

Validate whether the workflow can safely move forward. Check prerequisites, constraints, artifact completeness, and transition readiness. When blocking, explain exactly what is missing.`,
  },
};

function defaultConfigDir() {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  return xdgConfigHome ? join(xdgConfigHome, 'opencode') : join(homedir(), '.config', 'opencode');
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function hasPlugin(config, pluginSpec, pluginDir) {
  if (!Array.isArray(config.plugin)) return false;
  return config.plugin.some((entry) => {
    if (typeof entry === 'string') {
      return entry === pluginSpec || entry === pluginDir;
    }
    if (Array.isArray(entry)) {
      return entry[0] === pluginSpec || entry[0] === pluginDir;
    }
    return false;
  });
}

export async function ensureOpenCodeInstallation({ configDir = defaultConfigDir(), pluginDir, forceDefaultAgent = false }) {
  const resolvedPluginDir = pluginDir ?? process.cwd();
  const pluginSpec = pathToFileURL(resolvedPluginDir).href;
  const configPath = join(configDir, 'opencode.json');

  await mkdir(dirname(configPath), { recursive: true });

  let config = {
    $schema: 'https://opencode.ai/config.json',
  };

  try {
    config = await readJson(configPath);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
      throw error;
    }
  }

  if (!hasPlugin(config, pluginSpec, resolvedPluginDir)) {
    config.plugin = Array.isArray(config.plugin) ? [...config.plugin, pluginSpec] : [pluginSpec];
  }

  if (forceDefaultAgent || !config.default_agent) {
    config.default_agent = 'Prometheus';
  }

  const currentAgents = config.agent && typeof config.agent === 'object' ? config.agent : {};
  config.agent = { ...currentAgents };

  for (const agentName of OPENCODE_AGENT_NAMES) {
    if (!config.agent[agentName]) {
      config.agent[agentName] = AGENT_CONFIG[agentName];
    }
  }

  if (!config.$schema) {
    config.$schema = 'https://opencode.ai/config.json';
  }

  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  return config;
}

async function run() {
  if (process.env.CI || process.env.OH_MY_OPENSPEC_SKIP_INSTALL === '1') {
    return;
  }

  try {
    const config = await ensureOpenCodeInstallation({
      pluginDir: process.cwd(),
    });
    const pluginCount = Array.isArray(config.plugin) ? config.plugin.length : 0;
    console.log(`[oh-my-openspec] OpenCode configured. Plugins: ${pluginCount}. Default agent: ${config.default_agent}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[oh-my-openspec] Automatic OpenCode setup skipped: ${message}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await run();
}
