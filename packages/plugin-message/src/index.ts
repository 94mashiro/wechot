import { Context, IPlugin, Message } from '@wechot/core';
import { Document, Mongoose } from 'mongoose';
import { MessageType } from 'wechaty-puppet';

import { MessageHistoryModel } from './model';

interface IPluginOptions {
  recordRoomTopics: string[];
}

const WechotPluginMessagePlugin: IPlugin = {
  priority: 100,

  apply(ctx: Context, options: IPluginOptions) {
    const database = ctx.database as Mongoose;
    const MessageHistory = new MessageHistoryModel(database);
    const { recordRoomTopics } = options;
    const { events } = ctx;
    const handleReceiveMessage = async (message: Message) => {
      const targetRoom = message.room();
      if (!targetRoom) {
        return;
      }
      const roomTopic = await targetRoom.topic();
      const senderName = message.talker().name();
      if (!recordRoomTopics.includes(roomTopic) || senderName === 'bot' || senderName === roomTopic) {
        return;
      }
      const sendAt = message.date();
      const content = message.type() === MessageType.Text ? message.text() : '';
      // eslint-disable-next-line new-cap
      const modelInstance: Document = new MessageHistory.model({
        groupTopic: roomTopic,
        senderName: senderName,
        content: content,
        createAt: sendAt,
      });
      await modelInstance.save();
    };
    events.on('message', handleReceiveMessage);
  },
};

export default WechotPluginMessagePlugin;
