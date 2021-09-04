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
});

const boardSchema = new Schema({
  name: { type: String, required: true },
  idMemberCreator: {
    type: Schema.Types.ObjectId,
    ref: 'member',
    requied: true,
  },
  members: [memberInfo],
});

const Board = model('Board', boardSchema);

export default Board;
