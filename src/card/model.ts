import { model, Schema } from 'mongoose';

//perhaps have shared parent Schema for card and list?
const cardSchema = new Schema({
  name: { type: String, required: true },
  pos: { type: Number, required: true },
  idList: { type: Schema.Types.ObjectId, ref: 'list', required: true },
});

const Card = model('Card', cardSchema);

export default Card;
