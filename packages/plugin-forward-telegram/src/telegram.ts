import { EventEmitter } from 'events';
import { Context, Telegraf } from 'telegraf';
import { Message } from 'typegram';

export enum SupportMessageTypes {
  Text = 'text',
  Document = 'document',
  Photo = 'photo',
}

export class Telegram extends EventEmitter {
  static generateSenderDisplayName(message: Message) {
    if (!message.from) {
      return;
    }
    const { username, first_name, last_name } = message.from;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    } else if (!first_name && !last_name && username) {
      return username;
    }
    return first_name || last_name;
  }

  public session: Telegraf;

  constructor(token: string) {
    super();
    this.session = new Telegraf(token);
    this.initialize();
  }

  async initialize() {
    this.session.on('text', this.handleReceiveTextMessage.bind(this));
    this.session.on('document', this.handleReceiveDocumentMessage.bind(this));
    this.session.on('photo', this.handleReceivePhotoMessage.bind(this));
    await this.session.launch();
  }

  precheck(ctx: Context) {
    const message = ctx.message;
    const sendBySelf = ctx.message?.from.id === ctx.botInfo.id;
    if (!message || sendBySelf) {
      throw new Error('pre-check failed, skip it');
    }
    return;
  }

  async handleReceiveTextMessage(ctx: Context) {
    try {
      this.precheck(ctx);
      const message = ctx.message as Message.TextMessage;
      const displayName = Telegram.generateSenderDisplayName(message);
      const rawMessage = message.text;
      const isMultipleLineMessage = rawMessage.match(/\n/);
      let sendPayload: string;

      if (isMultipleLineMessage) {
        sendPayload = `[${displayName}]\n${rawMessage}`;
      } else {
        sendPayload = `[${displayName}] ${rawMessage}`;
      }

      super.emit('message', {
        type: SupportMessageTypes.Text,
        chatId: message.chat.id,
        payload: sendPayload,
      });
    } catch (e) {
      console.warn(e);
    }
  }

  async handleReceiveDocumentMessage(ctx: Context) {
    try {
      this.precheck(ctx);
      const message = ctx.message as Message.DocumentMessage;
      const documentFileId = message.document.file_id;
      const documentFileLink = await ctx.telegram.getFileLink(documentFileId);
      super.emit('message', {
        type: SupportMessageTypes.Document,
        chatId: message.chat.id,
        payload: documentFileLink,
      });
    } catch (e) {
      console.warn(e);
    }
  }

  async handleReceivePhotoMessage(ctx: Context) {
    try {
      this.precheck(ctx);
      const message = ctx.message as Message.PhotoMessage;
      const [_thumb, file_id] = message.photo;
      const photoLink = (await ctx.telegram.getFileLink(file_id)).toString();
      super.emit('message', {
        type: SupportMessageTypes.Photo,
        chatId: message.chat.id,
        payload: photoLink,
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
