import createBoard from './board/createBoard';
import updateBoardName from './board/updateBoardName';
import deleteBoard from './board/deleteBoard';
import createList from './list/createList';
import updateListName from './list/updateListName';
import updateListPos from './list/updateListPos';
import deleteList from './list/deleteList';

const mutations = {
  createBoard,
  updateBoardName,
  deleteBoard,
  createList,
  updateListName,
  updateListPos,
  deleteList,
};

export default mutations;
