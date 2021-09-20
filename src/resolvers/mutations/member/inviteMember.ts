import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import pubsub from '../../pubsub';
import me from '../../me';
import Member from '../../../models/member';
import getAggBoard from '../../../resolvers/getAggBoard';

const inviteMember = async (_: any, { input }: any, ctx: any) => {
  try {
    if (!ctx.currentMember) {
      throw new AuthenticationError('Not authenticated');
    }

    const myMemberInfo = await me(ctx.currentMember._id);

    const { email, boardId } = input;

    //@ts-ignore
    if (!myMemberInfo.idBoards.includes(boardId)) {
      throw new AuthenticationError('Not authorized to view this content');
    }
    const member = await Member.findOne({ email });
    //@ts-ignore
    if (member.idBoards.includes(boardId)) {
      throw new UserInputError('Member already belongs to this board!');
    }
    //@ts-ignore
    member.idBoards.push(boardId);
    await member.save();
    //@ts-ignore
    const board = await Board.findById(boardId);

    const memberObject = {
      idMember: member._id,
      memberType: 'normal',
      //@ts-ignore
      fullName: member.fullName,
      //@ts-ignore
      username: member.username,
      //@ts-ignore
      initials: member.initials,
    };
    //@ts-ignore
    board.members.push(memberObject);
    await board.save();

    const newBoard = await getAggBoard(boardId);
    pubsub.publish('BOARD_UPDATED', { boardUpdated: newBoard });

    const newBoardObj = {
      memberId: member._id,
      boardObj: { name: newBoard[0].name, _id: newBoard[0]._id },
    };

    pubsub.publish('NEW_BOARD', { newBoard: newBoardObj });

    return member;
  } catch (e) {
    console.log(e);
  }
};

export default inviteMember;
