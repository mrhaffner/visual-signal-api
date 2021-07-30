import { Schema, model } from 'mongoose';

const columnSchema = new Schema({
  title: { type: String, required: true },
  index: { type: Number, required: true },
});

const Column = model('Column', columnSchema);

export default Column;
