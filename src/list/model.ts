import { Schema, model } from 'mongoose';

//perhaps have shared parent Schema for card and list?
const listSchema = new Schema({
  name: { type: String, required: true },
  pos: { type: Number, required: true },
});

const List = model('List', listSchema);

export default List;
