import createBoard from './board/createBoard';
import updateBoardName from './board/updateBoardName';
import deleteBoard from './board/deleteBoard';
import createList from './list/createList';
import updateListName from './list/updateListName';
import updateListPos from './list/updateListPos';
import deleteList from './list/deleteList';
import createCard from './card/createCard';
import updateCardName from './card/updateCardName';
import updateCardPos from './card/updateCardPos';
import deleteCard from './card/deleteCard';
import createMember from './member/createMember';
import inviteMember from './member/inviteMember';
import removeMemberFromBoard from './member/removeMemberFromBoard';

const mutations = {
  createBoard,
  updateBoardName,
  deleteBoard,
  createList,
  updateListName,
  updateListPos,
  deleteList,
  createCard,
  updateCardName,
  updateCardPos,
  deleteCard,
  createMember,
  inviteMember,
  removeMemberFromBoard,
};

export default mutations;
