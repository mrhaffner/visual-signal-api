import { withFilter } from 'graphql-subscriptions';
import pubsub from '../pubsub';

const removeFromBoard = {
  subscribe: withFilter(
    () => pubsub.asyncIterator('REMOVED_FROM_BOARD'),
    (payload, _, ctx) => {
      try {
        return (
          payload.removeFromBoard.memberId.toString() ===
          ctx.currentMember._id.toString()
        );
      } catch (e) {
        console.log(e);
      }
    },
  ),
};

export default removeFromBoard;
