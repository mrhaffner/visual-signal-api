import { AuthenticationError } from 'apollo-server-errors';
import pubsub from '../../pubsub';
import me from '../../me';
import List from '../../../models/list';
import getAggBoard from '../../../resolvers/getAggBoard';
import NewPosRules from '../../../validations/newPos';

const updateListPos = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { _id, pos, idBoard } = input;
    await NewPosRules.validateAsync({ pos });

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(idBoard)) {
      throw new AuthenticationError('Not authorized to view this content');
    }
    const list = await List.findOneAndUpdate(
      { _id },
      { pos },
      {
        new: true,
      },
    );

    const board = await getAggBoard(idBoard);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

    return list;
  } catch (e) {
    console.log(e);
  }
};

export default updateListPos;
