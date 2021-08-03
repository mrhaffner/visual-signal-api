import { Schema, model } from 'mongoose';

const listSchema = new Schema({
  title: { type: String, required: true },
  index: { type: Number, required: true },
});

const List = model('List', listSchema);

export default List;
