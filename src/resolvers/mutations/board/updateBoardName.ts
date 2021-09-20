import Board from '../../../models/board';
import { AuthenticationError } from 'apollo-server-errors';
import me from '../../me';
import pubsub from '../../pubsub';
import getAggBoard from '../../getAggBoard';
import NewBoardRules from '../../../validations/board';

const updateBoardName = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);
    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(_id)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

    const { _id, name } = input;
    await NewBoardRules.validateAsync({ name });

    await Board.findOneAndUpdate(
      { _id },
      { name },
      {
        new: true,
      },
    );

    const board = await getAggBoard(_id);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: board });
    return board;
  } catch (e) {
    console.log(e);
  }
};

export default updateBoardName;
