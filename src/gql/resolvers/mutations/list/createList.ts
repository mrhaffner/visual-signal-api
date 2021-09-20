import { AuthenticationError } from 'apollo-server-errors';
import NewListRules from '../../validations/list';
import pubsub from '../../pubsub';
import me from '../../helpers/me';
import List from '../../../../models/list';
import getAggBoard from '../../helpers/getAggBoard';

const createList = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);
    await NewListRules.validateAsync(input);

    const { name, pos, idBoard } = input;

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(idBoard)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

    const list = await List.create({ name, pos, idBoard });

    const board = await getAggBoard(idBoard);

    pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

    return list;
  } catch (e) {
    console.log(e);
  }
};

export default createList;
