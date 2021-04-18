import { Message, Wechaty } from 'wechaty';
import { MessageType } from 'wechaty-puppet';

import { Command } from './command';
import { Context } from './context';

export interface ISessionOption {
  name: string;
}

export class Session {
  public sessionOption: ISessionOption;
  public session: Wechaty | null = null;
  private context: Context;

  constructor(sessionOption: ISessionOption, context: Context) {
    this.sessionOption = sessionOption;
    this.context = context;
    this.initialize();
  }

  fixedMentionSelf(message: Message) {
    const botName = this.session?.userSelf().name();
    return message.type() === MessageType.Text && message.text().startsWith(`@${botName}`);
  }

  async handleReceiveMessage(message: Message) {
    // !: 框架自带的 isMentionSelf() 方法暂时不可用，自己实现一个简陋的版本代替，需要不设置群名片
    const isMentionSelf = this.fixedMentionSelf(message);
    const senderName = message.talker().name();
    if (isMentionSelf) {
      // *: 命令模式
      const botName = this.session!.userSelf().name();
      const rawCommand = message.text().split(`@${botName}`)?.[1]?.split('<br/>')?.[0];
      if (rawCommand) {
        const commandArgs = Command.parseCommandString(rawCommand);
        const replyMessage: string = await this.context.command.parse(commandArgs);
        if (replyMessage) {
          const isMultipleLine = replyMessage.match('\n');
          const mentionHideChar = ' ';
          const payloadMessage = `@${senderName}${mentionHideChar}${isMultipleLine ? '\n' : ' '}${replyMessage}`;
          await message.say(payloadMessage);
        }
      }
    }
    this.context.events.emit('message', message);
  }

  handleConnected() {
    this.context.events.emit('connect');
    this.session!.on('message', this.handleReceiveMessage.bind(this));
  }

  handleShowLoginLink(link: string) {
    console.log(`Login URL: https://wechaty.js.org/qrcode/${encodeURIComponent(link)}`);
  }

  async initialize() {
    const session = new Wechaty(this.sessionOption);
    this.session = session;
    session.on('scan', this.handleShowLoginLink.bind(this));
    session.on('login', this.handleConnected.bind(this));
    await session.start();
  }
}
