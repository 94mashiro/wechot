import { Context, IPlugin, Message } from '@wechot/core';
import { FileBox } from 'wechaty';
import { MessageType } from 'wechaty-puppet';

import { SupportMessageTypes, Telegram } from './telegram';
import { findTargetForward } from './utils';

export interface IForwardType {
  wechat: string;
  telegram: number;
}

interface IPluginOptions {
  // 由于微信群聊ID会随Session动态变化，所以配置中存入群聊标题用于搜索ID
  forwardSet?: IForwardType[];
  token: string;
  wechatBotId: string;
}

interface ITelegramMessageEventPayload {
  type: SupportMessageTypes;
  chatId: number;
  payload: any;
}

const WechotPluginForwardTelegram: IPlugin = {
  priority: 100,

  apply(context: Context, options: IPluginOptions) {
    const { events, session } = context;
    const { forwardSet: configForwardSet = [], token, wechatBotId } = options ?? {};
    const forwardSet = [...configForwardSet];
    if (!token) {
      console.warn('this plugin need telegram bot token');
      return;
    }
    const telegram = new Telegram(token);

    const handleReceiveWechatMessage = async (message: Message) => {
      const fromRoom = message.room();
      const talker = message.talker();

      if (talker.name() === 'bot') {
        return;
      }

      if (!fromRoom) {
        return;
      }

      const wechatRoomTopic = await fromRoom.topic();
      if (!wechatRoomTopic) {
        return;
      }

      const targetForward = findTargetForward(forwardSet, { wechat: wechatRoomTopic });
      if (!targetForward) {
        return;
      }

      switch (message.type()) {
        case MessageType.Text: {
          const rawMessage = message.text();
          const isMultipleLineMessage = rawMessage.match(/<br\/>/);
          // 处理换行，链接乱码
          let sendPayload: string = rawMessage.replace(/<br\/>/g, '\n').replace(/<a[^>]+>([^<]+)<\/a>/, '$1');

          if (isMultipleLineMessage) {
            sendPayload = sendPayload = `[${talker.name()}]\n` + sendPayload;
          } else {
            sendPayload = `[${talker.name()}] ${sendPayload}`;
          }

          await telegram.session.telegram.sendMessage(targetForward.telegram, sendPayload);
          return;
        }
        case MessageType.Image: {
          const realImageUrl = message
            .text()
            .match(/cdnurl="([^"]+)"/)?.[1]
            ?.replace(/amp;amp;/g, '');
          if (realImageUrl) {
            await telegram.session.telegram.sendDocument(
              targetForward.telegram,
              {
                url: realImageUrl,
                filename: `${(Math.random() * 100000).toFixed(0)}.gif`,
              },
              {
                caption: talker.name(),
              },
            );
            return;
          }
          const imageBuffer = await (await message.toImage().hd()).toBuffer();
          await telegram.session.telegram.sendPhoto(targetForward.telegram, {
            source: imageBuffer,
          });
          return;
        }
        default: {
          console.warn('unsupported message type, ignore it.');
          return;
        }
      }
    };

    const handleReceiveTelegramMessage = async (data: ITelegramMessageEventPayload) => {
      const { chatId, type, payload } = data;
      const targetForward = findTargetForward(forwardSet, { telegram: chatId });
      if (!targetForward) {
        return;
      }

      const wechatRoomTopic = targetForward.wechat;
      const room = await session.session?.Room.find({ topic: wechatRoomTopic });

      if (!room) {
        return;
      }

      switch (type) {
        case SupportMessageTypes.Text: {
          await room.say(payload as string);
          return;
        }
        case SupportMessageTypes.Document:
        case SupportMessageTypes.Photo: {
          const fileBoxIns = FileBox.fromUrl(payload);
          await room.say(fileBoxIns);
          return;
        }
        default: {
          console.warn('unsupported message type, ignore it.');
          return;
        }
      }
    };

    events.on('message', handleReceiveWechatMessage.bind(this));
    telegram.on('message', handleReceiveTelegramMessage.bind(this));
  },
};

export default WechotPluginForwardTelegram;
