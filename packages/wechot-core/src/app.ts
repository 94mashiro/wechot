import { requireConfigFile } from '@wechot/utils';
import { EventEmitter } from 'events';
import TypedEventEmitter from 'typed-emitter';

import { Command } from './command';
import { Context } from './context';
import { IWechotEvents } from './event-emitter';
import { injectPlugins } from './plugin';
import { Session } from './session';

export type IAppConfigPlugin = string | [string, Record<string, any>];

export interface IAppConfig {
  name?: string;
  plugins?: IAppConfigPlugin[];
}

export interface IAppOptions {
  name?: string;
}

export class App {
  static defaultAppOptions: IAppOptions = {
    name: 'wechot',
  };

  public app = this;
  public appOptions: IAppOptions;
  public session: Session;
  public context: Context;
  public command: Command;
  public eventEmitter: TypedEventEmitter<IWechotEvents>;

  constructor() {
    const context = new Context(this.app);
    const config = requireConfigFile() as IAppConfig;
    this.context = context;
    this.eventEmitter = new EventEmitter();
    this.command = new Command();
    this.appOptions = {
      name: config.name ?? App.defaultAppOptions.name,
    };
    this.session = new Session(
      {
        name: this.appOptions.name!,
      },
      context,
    );
    this.eventEmitter.on('connect', async () => {
      console.log('login success');
      await injectPlugins(context, config.plugins);
    });
  }
}
