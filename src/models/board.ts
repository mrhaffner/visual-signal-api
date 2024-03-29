import { model, Schema } from 'mongoose';

const colorEnum = [
  'blue',
  'orange',
  'green',
  'red',
  'purple',
  'pink',
  'lime',
  'sky',
  'grey',
];

const memberInfo = new Schema({
  idMember: {
    type: Schema.Types.ObjectId,
    ref: 'member',
    required: true,
  },
  memberType: {
    type: String,
    default: 'normal',
    enum: ['normal', 'admin'],
  },
  //unconfirmed?
  //deactivated?
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  initials: { type: String, required: true },
});

const boardSchema = new Schema({
  name: { type: String, required: true, max: 30 },
  idMemberCreator: {
    type: Schema.Types.ObjectId,
    ref: 'member',
    required: true,
  },
  members: [memberInfo],
  color: { type: String, enum: colorEnum, default: 'grey' },
});

//when board is created, memberInfo for owner is automatically added to array

const Board = model('Board', boardSchema);

export default Board;
