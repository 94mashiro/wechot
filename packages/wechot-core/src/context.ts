import { App } from './app';

export class Context {
  private app: App;
  private _database: unknown;

  constructor(app: App) {
    this.app = app;
  }

  get events() {
    return this.app.eventEmitter;
  }

  get command() {
    return this.app.command;
  }

  get session() {
    return this.app.session;
  }

  get database() {
    if (!this._database) {
      console.warn('database is not set already.');
      return {};
    }
    return this._database;
  }

  set database(instance: any) {
    this._database = instance;
  }

  get schedule() {
    return this.app.schedule;
  }
}
