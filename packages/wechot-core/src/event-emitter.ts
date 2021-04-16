import { EventEmitter } from 'events';
import { Message } from 'wechaty';

import { Context } from './context';

export type IWechotEventName = 'message' | 'connect' | 'disconnect';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type PromiseOrNot<T = void> = T | Promise<T>;

export interface IWechotEvents {
  message: (message: Message) => PromiseOrNot;
  connect: () => PromiseOrNot;
  disconnect: () => PromiseOrNot;
}

export class WechotEventEmitter extends EventEmitter {
  on(event: IWechotEventName, fn: (...args: any[]) => any): this {
    return super.on(event, fn);
  }

  emit(event: IWechotEventName, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}
