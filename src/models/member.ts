import { model, Schema } from 'mongoose';

const memberSchema = new Schema({
  fullName: { type: String, required: true },
  initials: { type: String, required: true }, //generate here?
  username: { type: String, required: true }, //generate here?
  idBoards: [{ type: Schema.Types.ObjectId, ref: 'board' }],
  password: { type: String, required: true }, //make this safe and hashed later
  //add memberType maybe
  //add "status" section with field "connected" or "disconnected" to see if they are online?
});

const Member = model('Member', memberSchema);

export default Member;
