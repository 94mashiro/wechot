import { Context, IPlugin } from '@wechot/core';

const WechotPluginPing: IPlugin = {
  priority: 100,

  apply(context: Context) {
    const { command } = context;
    command
      .register('ping [operator] [value]', 'receive pong')
      ?.option('--out <dir>', 'out dir')
      .example('ping add hello\nping remove hello\nping vote hello')
      .action(() => 'pong');

    command.list();
  },
};

export default WechotPluginPing;
