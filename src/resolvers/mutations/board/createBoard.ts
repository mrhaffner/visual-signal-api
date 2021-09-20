import { AuthenticationError } from 'apollo-server-errors';
import NewNameRules from '../../../validations/newName';
import Board from '../../../models/board';
import Member from '../../../models/member';
import pubsub from '../../pubsub';

const createBoard = async (_: any, { name }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    await NewNameRules.validateAsync({ name });

    const idMemberCreator = ctx.currentMember._id;
    const members = [
      {
        idMember: idMemberCreator,
        memberType: 'admin',
        fullName: ctx.currentMember.fullName,
        username: ctx.currentMember.username,
        initials: ctx.currentMember.initials,
      },
    ];

    const board = await Board.create({
      name,
      idMemberCreator,
      members,
    });

    const member = await Member.findById(idMemberCreator);
    // @ts-ignore comment
    member.idBoards.push(board._id);
    await member.save();

    const newBoardObj = {
      memberId: idMemberCreator,
      boardObj: { name, _id: board._id },
    };

    pubsub.publish('NEW_BOARD', { newBoard: newBoardObj });

    return board;
  } catch (e) {
    console.log(e);
  }
};

export default createBoard;
