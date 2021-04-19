import { Model, Mongoose } from 'mongoose';

export class BilibiliLiveReminderModel {
  public model: Model<any>;

  constructor(database: Mongoose) {
    const schema = new database.Schema({
      groupTopic: [String],
      mid: {
        type: Number,
        index: true,
      },
      name: String,
      createAt: { type: Date, default: Date.now },
    });
    this.model = database.model('bilibili_live_reminders', schema);
  }
}
