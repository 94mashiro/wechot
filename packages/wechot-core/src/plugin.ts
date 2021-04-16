import { requireDefault, runAsyncFns } from '@wechot/utils';

import { IAppConfigPlugin } from './app';
import { Context } from './context';
import { PromiseOrNot } from './event-emitter';

export interface IPlugin {
  apply: (context: Context, ...args: any[]) => PromiseOrNot;
  priority: number;
}

export const injectPlugins = async (context: Context, plugins: IAppConfigPlugin[] = []) => {
  const pluginFns = plugins
    .map((pluginConfig) => {
      if (typeof pluginConfig === 'string') {
        const plugin: IPlugin = requireDefault(pluginConfig);
        return plugin;
      }
      if (Array.isArray(pluginConfig)) {
        const [pluginName, pluginOption] = pluginConfig;
        const plugin: IPlugin = requireDefault(pluginName);
        return {
          priority: plugin.priority,
          apply: async (context: Context) => await plugin.apply(context, pluginOption),
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.priority - b!.priority)
    .map((plugin) => plugin!.apply);
  if (pluginFns.length) {
    await runAsyncFns(pluginFns, context);
  }
};
