import { AuthenticationError, ValidationError } from 'apollo-server-errors';
import pubsub from '../../pubsub';
import me from '../../helpers/me';
import Board from '../../../models/board';
import getAggBoard from '../../helpers/getAggBoard';

const updateMemberLevelBoard = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { memberId, boardId, newMemberLevel } = input;

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(boardId)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

    if (newMemberLevel !== 'admin' && newMemberLevel !== 'normal') {
      throw new ValidationError('Invalid user level');
    }

    const board = await Board.findById(boardId);

    //@ts-ignore
    const myMemberLevel = board.members.filter(
      (memObj: any) =>
        memObj.idMember.toString() === ctx.currentMember._id.toString(),
    )[0].memberType;

    //can only change if admin
    if (myMemberLevel !== 'admin') {
      throw new AuthenticationError('Not authorized');
    }
    //can only change an admin to normal if there is another admin === 2
    //@ts-ignore
    const adminCount = board.members.filter(
      (obj: any) => obj.memberType === 'admin',
    ).length;

    if (adminCount === 1 && newMemberLevel === 'normal') {
      throw new AuthenticationError('Not authorized');
    }

    await Board.findOneAndUpdate(
      { _id: boardId, 'members.idMember': memberId },
      { 'members.$.memberType': newMemberLevel },
    );

    const newBoard = await getAggBoard(boardId);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: newBoard });

    return memberId;
  } catch (e) {
    console.log('error', e);
  }
};

export default updateMemberLevelBoard;
