import List from '../../../models/list';
import Card from '../../../models/card';
import Board from '../../../models/board';
import Member from '../../../models/member';

export const allBoards = async () => {
  return await Board.find();
};
export const allLists = async () => {
  const lists = await List.aggregate([
    {
      $lookup: {
        from: 'cards',
        localField: '_id',
        foreignField: 'idList',
        pipeline: [
          {
            $sort: { pos: 1 },
          },
        ],
        as: 'cards',
      },
    },
  ]).sort('pos');
  return lists;
};
export const getAllCards = async () => {
  return await Card.find();
};
export const getCardById = async (_: any, { _id }: any) => {
  return await Card.findOne({ _id });
};
export const getAllMembers = async () => {
  return await Member.find();
};
export const getMemberByEmail = async (_: any, { email }: any) => {
  return await Member.findOne({ email });
};
