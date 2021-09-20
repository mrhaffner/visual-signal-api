import { model, Schema } from 'mongoose';

const cardSchema = new Schema({
  name: { type: String, required: true },
  pos: { type: Number, required: true },
  idList: { type: Schema.Types.ObjectId, ref: 'list', required: true },
  idBoard: { type: Schema.Types.ObjectId, ref: 'board', required: true },
  //idMembers: [{ type: Schema.Types.ObjectId, ref: 'member', required: true }]
});

const Card = model('Card', cardSchema);

export default Card;
