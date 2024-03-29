import Board from '../../../../models/board';
import { AuthenticationError } from 'apollo-server-errors';
import me from '../../helpers/me';
import pubsub from '../../pubsub';
import getAggBoard from '../../helpers/getAggBoard';
import NewNameRules from '../../validations/newName';

const updateBoardName = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { _id, name } = input;
    await NewNameRules.validateAsync({ name });

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(_id)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

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
