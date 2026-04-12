import type { Plugin, PluginInput, Hooks } from '@opencode-ai/plugin';

export const prometheusSpeckitPlugin: Plugin = async (
  input: PluginInput,
  _options?: Record<string, unknown>
): Promise<Hooks> => {
  console.log('[prometheus-speckit] Plugin loaded');

  return {
    tool: {},
  };
};

export default prometheusSpeckitPlugin;
