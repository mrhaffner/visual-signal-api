import { AuthenticationError } from 'apollo-server-errors';
import NewCardRules from '../../../validations/card';
import pubsub from '../../pubsub';
import me from '../../helpers/me';
import Card from '../../../models/card';
import getAggBoard from '../../helpers/getAggBoard';

const createCard = async (_: any, { input }: any, ctx: any) => {
  try {
    await NewCardRules.validateAsync(input);
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);
    const { name, pos, idList, idBoard } = input;

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(idBoard)) {
      throw new AuthenticationError('Not authorized to view this content');
    }
    const card = await Card.create({ name, pos, idList, idBoard });

    const board = await getAggBoard(idBoard);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

    return card;
  } catch (e) {
    console.log(e);
  }
};

export default createCard;
