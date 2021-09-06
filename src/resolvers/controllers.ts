import Board from '../models/board';
import mongoose from 'mongoose';
import Member from '../models/member';
const ObjectId = mongoose.Types.ObjectId;

export const getBoardById = async (_: any, { _id }: any) => {
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

export const getMemberBoards = async (_: any, { _id }: any) => {
  const member = await Member.findOne({ _id });
  // @ts-ignore comment
  const ids = member.idBoards;
  return await Board.find({ _id: { $in: ids } });
};
