import { AuthenticationError } from 'apollo-server-errors';
import { withFilter } from 'graphql-subscriptions';
import pubsub from '../pubsub';

const newBoard = {
  subscribe: withFilter(
    () => pubsub.asyncIterator('NEW_BOARD'),
    (payload, __, ctx) => {
      try {
        return (
          ctx.currentMember._id.toString() ===
          payload.newBoard.memberId.toString()
        );
      } catch (e) {
        console.log(e);
      }
    },
  ),
};

export default newBoard;
