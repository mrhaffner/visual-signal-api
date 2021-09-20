import me from '../me';
import { AuthenticationError } from 'apollo-server-errors';
import getAggBoard from '../getAggBoard';
import getMyBoardsHelper from '../getMyBoardsHelper';

export const getBoardById = async (_: any, { _id }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);
    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(_id)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

    const board = await getAggBoard(_id);
    return board;
  } catch (e) {
    console.log(e);
  }
};

export const getMyBoards = async (_: any, __: any, { currentMember }: any) => {
  try {
    if (!currentMember) {
      throw new AuthenticationError('Not authenticated');
    }
    return await getMyBoardsHelper(currentMember._id);
  } catch (e) {
    console.log(e);
  }
};
