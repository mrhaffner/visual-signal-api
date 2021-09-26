import { AuthenticationError } from 'apollo-server-errors';
import Board from '../../../../models/board';
import Member from '../../../../models/member';
import pubsub from '../../pubsub';
import NewBoardRules from '../../validations/newBoard';

const createBoard = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    await NewBoardRules.validateAsync(input);

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
      idMemberCreator,
      members,
      ...input,
    });

    const member = await Member.findById(idMemberCreator);
    // @ts-ignore comment
    member.idBoards.push(board._id);
    await member.save();

    const newBoardObj = {
      memberId: idMemberCreator,
      boardObj: { ...input, _id: board._id },
    };

    pubsub.publish('NEW_BOARD', { newBoard: newBoardObj });

    return board;
  } catch (e) {
    console.log(e);
  }
};

export default createBoard;
