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
      const messageType = message.type();
      const content = messageType === MessageType.Text ? message.text() : '';
      // eslint-disable-next-line new-cap
      const modelInstance: Document = new MessageHistory.model({
        groupTopic: roomTopic,
        senderName: senderName,
        content: content,
        createAt: sendAt,
        messageType: messageType,
      });
      await modelInstance.save();
    };
    const handleSearchTopList = async (message: Message, limit = '10') => {
      // eslint-disable-next-line no-param-reassign
      const roomTopic = await message.room()?.topic();
      if (!roomTopic || !recordRoomTopics.includes(roomTopic)) {
        return null;
      }
      const startAt = new Date();
      startAt.setHours(0, 0, 0, 0);
      const endAt = new Date();
      endAt.setHours(24, 0, 0, 0);
      const results = await MessageHistory.model
        .find({
          createAt: {
            $gte: startAt,
            $lte: endAt,
          },
          groupTopic: roomTopic,
        })
        .exec();
      let outputTupleSet: [string, number][] = [];
      results.forEach((item) => {
        const targetTuple = outputTupleSet.find((tuple) => tuple[0] === item.senderName);
        if (!targetTuple) {
          outputTupleSet.push([item.senderName, 1]);
        } else {
          targetTuple[1] += 1;
        }
      });
      outputTupleSet = outputTupleSet.sort((a, b) => b[1] - a[1]).slice(0, Number(limit));
      let outputMessage = `${startAt.getMonth() + 1}月${startAt.getDate()}日发言排行榜：\n`;
      outputTupleSet.forEach((tuple, idx) => {
        outputMessage += `${tuple[0]}：${tuple[1]} ${idx === 0 ? '👑' : ''}\n`;
      });
      return outputMessage;
    };
    events.on('message', handleReceiveMessage);
    ctx.command.register('top', handleSearchTopList, '发言排行榜');
  },
};

export default WechotPluginMessagePlugin;
