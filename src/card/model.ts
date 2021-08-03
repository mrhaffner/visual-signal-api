import { model, Schema } from 'mongoose';

const cardSchema = new Schema({
  content: { type: String, required: true },
  index: { type: Number, required: true },
  listId: { type: Schema.Types.ObjectId, ref: 'list', required: true },
});

const Card = model('Card', cardSchema);

export default Card;
