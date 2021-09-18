import Board from '../models/board';
import Member from '../models/member';
import me from './me';
import { AuthenticationError } from 'apollo-server-errors';
import getAggBoard from './getAggBoard';

export const getBoardById = async (_: any, { _id }: any, ctx: any) => {
  if (!ctx.currentMember) {
    throw new AuthenticationError('Not authenticated');
  }

  const myMemberInfo = await me(ctx.currentMember._id);
  //@ts-ignore
  if (!myMemberInfo.idBoards.includes(_id)) {
    throw new AuthenticationError('Not authorized to view this content');
  }

  const board = await getAggBoard(_id);
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
