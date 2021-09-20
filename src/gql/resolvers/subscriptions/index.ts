import newBoard from './newBoard';
import boardUpdated from './boardUpdated';
import boardDeleted from './boardDeleted';
import removeFromBoard from './removeFromBoard';

const subscriptions = {
  newBoard,
  boardUpdated,
  boardDeleted,
  removeFromBoard,
};

export default subscriptions;
