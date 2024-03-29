import { AuthenticationError } from 'apollo-server-errors';
import NewNameRules from '../../validations/newName';
import pubsub from '../../pubsub';
import me from '../../helpers/me';
import List from '../../../../models/list';
import getAggBoard from '../../helpers/getAggBoard';

const updateListName = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { _id, name, idBoard } = input;
    await NewNameRules.validateAsync({ name });
    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(idBoard)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

    const list = await List.findOneAndUpdate(
      { _id },
      { name },
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

export default updateListName;
