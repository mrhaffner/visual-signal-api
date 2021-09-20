import { withFilter } from 'graphql-subscriptions';
import pubsub from '../pubsub';
import getMyBoardsHelper from '../getMyBoardsHelper';

const boardUpdated = {
  subscribe: withFilter(
    () => pubsub.asyncIterator('BOARD_UPDATED'),
    async (payload, _, ctx) => {
      try {
        const boards = await getMyBoardsHelper(ctx.currentMember._id);

        for (const x of boards) {
          if (x._id.toString() === payload.boardUpdated[0]._id.toString())
            return true;
        }
        return false;
      } catch (e) {
        console.log(e);
      }
    },
  ),
};

export default boardUpdated;
