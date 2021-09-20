import { withFilter } from 'graphql-subscriptions';
import pubsub from '../pubsub';

const boardDeleted = {
  subscribe: withFilter(
    () => pubsub.asyncIterator('BOARD_DELETED'),
    (payload, variables) => {
      try {
        for (const id of variables.idBoards) {
          if (payload.boardDeleted === id) {
            return true;
          }
        }
        return false;
      } catch (e) {
        console.log(e);
      }
    },
  ),
};
export default boardDeleted;
