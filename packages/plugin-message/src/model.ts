import { Model, Mongoose } from 'mongoose';

export class MessageHistoryModel {
  public model: Model<any>;

  constructor(database: Mongoose) {
    const schema = new database.Schema({
      groupTopic: String,
      senderName: String,
      content: String,
      messageType: { type: Number, default: 7 },
      createAt: { type: Date, default: Date.now },
    });
    this.model = database.model('messages', schema);
  }
}
