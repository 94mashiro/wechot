import { Context, IPlugin } from '@wechot/core';

const WechotPluginPing: IPlugin = {
  priority: 100,

  apply(context: Context) {
    const { command } = context;
  },
};

export default WechotPluginPing;
