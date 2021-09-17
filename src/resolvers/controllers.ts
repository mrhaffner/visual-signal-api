import Board from '../models/board';
import mongoose from 'mongoose';
import Member from '../models/member';
import { AuthenticationError } from 'apollo-server-errors';
const ObjectId = mongoose.Types.ObjectId;

export const getBoardById = async (_: any, { _id }: any, ctx: any) => {
  if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(_id)) {
    throw new AuthenticationError('Not authorized to view this content');
  }

  const board = await Board.aggregate([
    {
      $match: { _id: ObjectId(_id) },
    },
    {
      $lookup: {
        from: 'lists',
        let: { idBoard: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$idBoard', '$$idBoard'] } } },
          {
            $sort: { pos: 1 },
          },
          {
            $lookup: {
              from: 'cards',
              let: { idList: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$idList', '$$idList'] } } },
                {
                  $sort: { pos: 1 },
                },
              ],
              as: 'cards',
            },
          },
        ],
        as: 'lists',
      },
    },
  ]);
  return board; //board[0]
};

export const getMyBoards = async (_: any, __: any, { currentMember }: any) => {
  if (!currentMember) {
    throw new AuthenticationError('Not authenticated');
  }
  const member = await Member.findOne({ _id: currentMember._id });
  // @ts-ignore comment
  const ids = member.idBoards;
  return await Board.find({ _id: { $in: ids } });
};
