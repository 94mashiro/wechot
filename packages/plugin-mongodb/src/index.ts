import { Context, IPlugin } from '@wechot/core';

import { MongoDatabase } from './database';

interface IPluginOption {
  uri: string;
}

const WechotPluginMongoDB: IPlugin = {
  priority: 10,

  async apply(ctx: Context, options: IPluginOption) {
    const connection = new MongoDatabase({ uri: options.uri });
    await connection.start();
    ctx.database = connection.client;
  },
};

export default WechotPluginMongoDB;
