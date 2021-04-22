import { Context, IPlugin } from '@wechot/core';
import { FileBox } from 'wechaty';

const WechotPluginDrinkWater: IPlugin = {
  priority: 100,
  apply(ctx: Context, roomTopics: string[]) {
    const { schedule, session } = ctx;
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
    schedule('30 8-20/2 * * *', handleRemindDrinkWater.bind(this));
  },
};

export default WechotPluginDrinkWater;
