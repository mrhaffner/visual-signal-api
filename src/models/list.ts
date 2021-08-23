import { Schema, model } from 'mongoose';

const listSchema = new Schema({
  name: { type: String, required: true },
  pos: { type: Number, required: true },
  idBoard: { type: Schema.Types.ObjectId, ref: 'board', required: true },
});

const List = model('List', listSchema);

export default List;
