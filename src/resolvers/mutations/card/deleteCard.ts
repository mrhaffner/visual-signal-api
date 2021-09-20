import { AuthenticationError } from 'apollo-server-errors';
import pubsub from '../../pubsub';
import me from '../../helpers/me';
import Card from '../../../models/card';
import getAggBoard from '../../helpers/getAggBoard';

const deleteCard = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { _id, idBoard } = input;

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(idBoard)) {
      throw new AuthenticationError('Not authorized to view this content');
    }
    await Card.findOneAndRemove({
      _id,
    });

    const board = await getAggBoard(idBoard);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

    return _id;
  } catch (e) {
    console.log(e);
  }
};

export default deleteCard;
