import { AuthenticationError } from 'apollo-server-errors';
import NewPosRules from '../../../validations/newPos';
import pubsub from '../../pubsub';
import me from '../../helpers/me';
import Card from '../../../models/card';
import getAggBoard from '../../helpers/getAggBoard';

const updateCardPos = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { _id, pos, idList, idBoard } = input;

    await NewPosRules.validateAsync({ pos });
    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(idBoard)) {
      throw new AuthenticationError('Not authorized to view this content');
    }

    const updateObject = { pos };
    // @ts-ignore comment
    if (idList) updateObject.idList = idList;
    const card = await Card.findOneAndUpdate(
      {
        _id,
      },
      updateObject,
      {
        new: true,
      },
    );

    const board = await getAggBoard(idBoard);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

    return card;
  } catch (e) {
    console.log(e);
  }
};

export default updateCardPos;
