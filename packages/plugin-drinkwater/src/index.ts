import { Context, IPlugin } from '@wechot/core';
import { FileBox } from 'wechaty';

interface IPluginOption {
  roomTopics: string[];
  cronSchedule: string;
}

const WechotPluginDrinkWater: IPlugin = {
  priority: 100,
  apply(ctx: Context, option: IPluginOption) {
    const { schedule, session } = ctx;
    const { roomTopics, cronSchedule } = option;
    const handleRemindDrinkWater = () => {
      roomTopics.forEach(async (topic) => {
        const targetRoom = await session.session?.Room.find({
          topic,
        });
        if (!targetRoom) {
          return;
        }
        await targetRoom.say(
          FileBox.fromUrl('https://assets.usecallback.com/image/2021-04-22/059368e01448be4255135b013ab53eb2.png'),
        );
      });
    };
    schedule(cronSchedule, handleRemindDrinkWater.bind(this));
  },
};

export default WechotPluginDrinkWater;
