import { App } from './app';

export class Context {
  private app: App;

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
}
