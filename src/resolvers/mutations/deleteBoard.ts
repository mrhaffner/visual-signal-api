import Board from '../../models/board';
import { AuthenticationError } from 'apollo-server-errors';
import me from '../me';
import pubsub from '../pubsub';
import Member from '../../models/member';
import getMyMemberLevel from '../getMyMemberLevel';

const deleteBoard = async (_: any, { _id }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);
    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(_id)) {
      throw new AuthenticationError('Not authorized to delete board');
    }
    const board = await Board.findById(_id);

    const myMemberLevel = getMyMemberLevel(board, ctx.currentMember._id);

    if (myMemberLevel !== 'admin') {
      throw new AuthenticationError('Not authorized to delete board');
    }

    // @ts-ignore comment
    const boardMembers = board.members;

    for await (const mem of boardMembers) {
      const memberId = mem.idMember;
      const member = await Member.findById(memberId);
      // @ts-ignore comment
      const memberBoards = member.idBoards;
      const newBoards = memberBoards.filter((x: any) => x.toString() !== _id);
      // @ts-ignore comment
      member.idBoards = newBoards;
      member.save();
    }

    ///
    ///////
    ////delete all cards and lists!!!!!/////
    ////////
    ////

    await Board.findOneAndRemove({
      _id,
    });

    pubsub.publish('BOARD_DELETED', { boardDeleted: _id });
    return _id;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export default deleteBoard;
