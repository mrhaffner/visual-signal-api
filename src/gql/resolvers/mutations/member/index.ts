import createMember from './createMember';
import inviteMember from './inviteMember';
import removeMemberFromBoard from './removeMemberFromBoard';
import updateMemberLevelBoard from './updateMemberLevelBoard';
import login from './login';

const memberMutations = {
  createMember,
  inviteMember,
  removeMemberFromBoard,
  updateMemberLevelBoard,
  login,
};

export default memberMutations;
