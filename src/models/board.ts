import { model, Schema } from 'mongoose';

const memberInfo = new Schema({
  idMember: { type: Schema.Types.ObjectId, ref: 'member', requied: true },
  memberType: {
    type: String,
    default: 'normal',
    enum: ['normal', 'admin', 'owner'],
  },
  //unconfirmed?
  //deactivated?
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  initials: { type: String, required: true },
});

const boardSchema = new Schema({
  name: { type: String, required: true },
  idMemberCreator: {
    type: Schema.Types.ObjectId,
    ref: 'member',
    required: true,
  },
  members: [memberInfo],
});

//when board is created, memberInfo for owner is automatically added to array

const Board = model('Board', boardSchema);

export default Board;
