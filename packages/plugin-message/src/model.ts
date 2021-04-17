import { Model, Mongoose, Schema } from 'mongoose';

export class MessageHistoryModel {
  public model: Model<any>;

  constructor(database: Mongoose) {
    const schema = new database.Schema({
      groupTopic: String,
      senderName: String,
      content: String,
      createAt: { type: Date, default: Date.now },
    });
    this.model = database.model('messages', schema);
  }
}
