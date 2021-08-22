import { model, Schema } from 'mongoose';

const cardSchema = new Schema({
  name: { type: String, required: true },
  pos: { type: Number, required: true },
  idList: { type: Schema.Types.ObjectId, ref: 'list', required: true },
});

const Card = model('Card', cardSchema);

export default Card;
