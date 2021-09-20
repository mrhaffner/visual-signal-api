import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import pubsub from '../../pubsub';
import me from '../../me';
import Member from '../../../models/member';
import Board from '../../../models/board';
import getAggBoard from '../../../resolvers/getAggBoard';
import getMyMemberLevel from '../../../resolvers/getMyMemberLevel';

const removeMemberFromBoard = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { memberId, boardId } = input;

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(boardId)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

    const board = await Board.findById(boardId);

    //ensure a normal user can only leave a board, not remove another user
    const myMemberLevel = getMyMemberLevel(board, ctx.currentMember._id);

    if (
      myMemberLevel === 'normal' &&
      memberId !== ctx.currentMember._id.toString()
    ) {
      throw new AuthenticationError('Not authorized');
    }

    //cannot remove yourself if only admin
    //@ts-ignore
    const adminCount = board.members.filter(
      (obj: any) => obj.memberType === 'admin',
    ).length;
    if (
      ctx.currentMember._id.toString() === memberId &&
      myMemberLevel === 'admin' &&
      adminCount === 1
    ) {
      throw new AuthenticationError('Not authorized');
    }

    //cannot leave a board if there is only 1 user
    //@ts-ignore
    if (board.members.length === 1) {
      throw new AuthenticationError('Not authorized');
    }
    //@ts-ignore
    board.members = board.members.filter(
      (memObj: any) => memObj.idMember.toString() !== memberId,
    );

    await board.save();

    const member = await Member.findById(memberId);
    //@ts-ignore
    member.idBoards = member.idBoards.filter(
      (idBoard: any) => idBoard.toString() !== boardId,
    );

    await member.save();
    const removeObj = { memberId, boardId };

    pubsub.publish('REMOVED_FROM_BOARD', { removeFromBoard: removeObj });
    const newBoard = await getAggBoard(boardId);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: newBoard });

    //perhaps change what is returned?
    return memberId;
  } catch (e) {
    console.log(e);
  }
};

export default removeMemberFromBoard;
