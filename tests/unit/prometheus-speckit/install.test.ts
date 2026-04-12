import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  ensureOpenCodeInstallation,
  OPENCODE_AGENT_NAMES,
} from '../../../scripts/install-opencode.js';

describe('OpenCode installer', () => {
  it('creates opencode config with plugin and default agents when missing', async () => {
    const root = mkdtempSync(join(tmpdir(), 'oh-my-openspec-install-'));

    try {
      await ensureOpenCodeInstallation({
        configDir: root,
        pluginDir: '/plugins/oh-my-openspec',
      });

      const config = JSON.parse(readFileSync(join(root, 'opencode.json'), 'utf8')) as {
        plugin: string[];
        default_agent?: string;
        agent: Record<string, unknown>;
      };

      expect(config.plugin).toContain('file:///plugins/oh-my-openspec');
      expect(config.default_agent).toBe('Prometheus');
      expect(Object.keys(config.agent)).toEqual(OPENCODE_AGENT_NAMES);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('preserves existing config and appends the plugin without duplication', async () => {
    const root = mkdtempSync(join(tmpdir(), 'oh-my-openspec-install-'));

    try {
      writeFileSync(
        join(root, 'opencode.json'),
        JSON.stringify(
          {
            $schema: 'https://opencode.ai/config.json',
            default_agent: 'build',
            plugin: ['@warp-dot-dev/opencode-warp'],
            agent: {
              ExistingAgent: {
                description: 'keep me',
              },
            },
          },
          null,
          2,
        ),
      );

      await ensureOpenCodeInstallation({
        configDir: root,
        pluginDir: '/plugins/oh-my-openspec',
      });
      await ensureOpenCodeInstallation({
        configDir: root,
        pluginDir: '/plugins/oh-my-openspec',
      });

      const config = JSON.parse(readFileSync(join(root, 'opencode.json'), 'utf8')) as {
        plugin: string[];
        default_agent?: string;
        agent: Record<string, { description?: string }>;
      };

      expect(config.default_agent).toBe('build');
      expect(config.plugin).toEqual([
        '@warp-dot-dev/opencode-warp',
        'file:///plugins/oh-my-openspec',
      ]);
      expect(config.agent.ExistingAgent.description).toBe('keep me');
      for (const agentName of OPENCODE_AGENT_NAMES) {
        expect(config.agent[agentName]).toBeDefined();
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
