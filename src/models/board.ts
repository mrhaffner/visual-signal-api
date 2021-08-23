import { model, Schema } from 'mongoose';

const boardSchema = new Schema({
  name: { type: String, required: true },
});

const Board = model('Board', boardSchema);

export default Board;
