import Board from '../../../models/board';
import Member from '../../../models/member';

const getMyBoardsHelper = async (_id: string) => {
  const member = await Member.findOne({ _id });
  // @ts-ignore comment
  const ids = member.idBoards;
  return await Board.find({ _id: { $in: ids } });
};

export default getMyBoardsHelper;
