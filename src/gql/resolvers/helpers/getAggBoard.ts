import Board from '../../../models/board';
import mongoose from 'mongoose';

const getAggBoard = async (_id: string) => {
  const ObjectId = mongoose.Types.ObjectId;

  return await Board.aggregate([
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
};

export default getAggBoard;
