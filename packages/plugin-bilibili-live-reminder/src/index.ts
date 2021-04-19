import { Context, IPlugin, Message } from '@wechot/core';
import { got } from '@wechot/utils';
import { Document } from 'mongoose';

import { BilibiliLiveReminderModel } from './model';

const WechotPluginBilibiliLiveReminder: IPlugin = {
  priority: 100,
  apply(context: Context) {
    const { schedule, database, command } = context;
    const bilibiliLiveReminderModel = new BilibiliLiveReminderModel(database);
    const handleFetchLiveData = async () => {
      const reminders = await bilibiliLiveReminderModel.model.find().exec();
      if (!reminders) {
        return;
      }
      await Promise.all(
        reminders.map(async (data) => {
          const { mid, groupTopic, liveStatus }: { mid: number; groupTopic: string[]; liveStatus: number } = data;
          const upInfo = await got
            .get(`https://api.bilibili.com/x/space/acc/info`, {
              searchParams: {
                ts: Date.now(),
                mid: Number(mid),
              },
            })
            .json<Record<string, any>>();
          const {
            data: {
              name,
              live_room: { liveStatus: currentLiveStatus, url, title },
            },
          } = upInfo;
          if (currentLiveStatus === 1 && liveStatus !== 1) {
            await Promise.all(
              groupTopic.map(async (topic) => {
                const targetRoom = await context.session.session?.Room.find({
                  topic,
                });
                if (!targetRoom) {
                  return;
                }
                targetRoom.say(`关注的主播「${name}」开播了！\n直播标题：${title}\n直播链接：${url}`);
              }),
            );
          } else if (currentLiveStatus !== 1 && liveStatus === 1) {
            await bilibiliLiveReminderModel.model
              .findOneAndUpdate({ mid: Number(mid) }, { liveStatus: currentLiveStatus })
              .exec();
          }
        }),
      );
      return;
    };
    const handleLiveReminderCommand = async (message: Message, operator: string, mid: string) => {
      switch (operator) {
        case 'add': {
          if (!mid) {
            return '无效的 mid';
          }
          const roomTopic = await message.room()?.topic();
          if (!roomTopic) {
            return null;
          }

          const modelData = await bilibiliLiveReminderModel.model.findOne({ mid: Number(mid) }).exec();
          if (modelData) {
            if (modelData.groupTopic.includes(roomTopic)) {
              return '不要重复关注';
            } else {
              await bilibiliLiveReminderModel.model
                .updateOne({ mid: Number(mid) }, { groupTopic: [...modelData.groupTopic, roomTopic] })
                .exec();
              return `「${modelData.name}」关注成功`;
            }
          }
          const upInfo = await got
            .get(`https://api.bilibili.com/x/space/acc/info`, {
              searchParams: {
                ts: Date.now(),
                mid: Number(mid),
              },
            })
            .json<Record<string, any>>();
          if (!upInfo?.data) {
            return '无效的 mid';
          }
          const {
            data: { name },
          } = upInfo;
          // eslint-disable-next-line new-cap
          const modelInstance: Document = new bilibiliLiveReminderModel.model({
            groupTopic: [roomTopic],
            mid: Number(mid),
            name,
            createAt: new Date(),
          });
          await modelInstance.save();
          return `「${name}」关注成功`;
        }
        default: {
          return '无效指令';
        }
      }
    };
    command.register('bilibili-live', handleLiveReminderCommand);
    schedule('*/1 * * * *', handleFetchLiveData.bind(this));
  },
};

export default WechotPluginBilibiliLiveReminder;
