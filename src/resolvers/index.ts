import { withFilter } from 'graphql-subscriptions';
import List from '../models/list';
import Card from '../models/card';
import Board from '../models/board';
import Member from '../models/member';
import { getBoardById, getMyBoards } from './controllers';
import {
  AuthenticationError,
  UserInputError,
  ValidationError,
} from 'apollo-server-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import me from './me';
import getAggBoard from './getAggBoard';
import pubsub from './pubsub';
// import createBoard from './mutations/createBoard';
import mutations from './mutations';
import getMyMemberLevel from './getMyMemberLevel';

dotenv.config();
// const pubsub = new PubSub();
const JWT_SECRET = process.env.JWT_SECRET;

const resolvers = {
  Query: {
    allBoards: async () => {
      return await Board.find();
    }, //for testing only
    getBoardById,
    getMyBoards,
    allLists: async () => {
      const lists = await List.aggregate([
        {
          $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: 'idList',
            pipeline: [
              {
                $sort: { pos: 1 },
              },
            ],
            as: 'cards',
          },
        },
      ]).sort('pos');
      return lists;
    }, //for testing only
    getAllCards: async () => {
      return await Card.find();
    }, //for testing only
    getCardById: async (_: any, { _id }: any) => {
      return await Card.findOne({ _id });
    }, //for testing now, but may be used later
    getMyMemberInfo: async (_: any, __: any, { currentMember }: any) => {
      //make this so it only returs the needed fields, definitely not password
      // return ctx.currentMember;
      return await me(currentMember._id);
    },
    getAllMembers: async () => {
      return await Member.find();
    }, //for testing only
    getMemberByEmail: async (_: any, { email }: any) => {
      return await Member.findOne({ email });
    }, //may be used in the future, probably needs a version for admins and non admids or some sort of auth
  },
  Mutation: {
    ...mutations,
    createList: async (_: any, { input }: any, ctx: any) => {
      const { name, pos, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      const list = await List.create({ name, pos, idBoard });

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

      return list;
    },
    updateListName: async (_: any, { input }: any, ctx: any) => {
      const { _id, name, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      const list = await List.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );

      const board = await getBoardById(_, { _id: idBoard }, ctx);

      pubsub.publish('BOARD_UPDATED', { boardUpdated: board });
      return list;
    },
    updateListPos: async (_: any, { input }: any, ctx: any) => {
      const { _id, pos, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      const list = await List.findOneAndUpdate(
        { _id },
        { pos },
        {
          new: true,
        },
      );

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

      return list;
    },
    deleteList: async (_: any, { input }: any, ctx: any) => {
      const { _id, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      try {
        await List.findOneAndRemove({
          _id,
        });

        const board = await getBoardById(_, { _id: idBoard }, ctx);
        pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    createCard: async (_: any, { input }: any, ctx: any) => {
      const { name, pos, idList, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      const card = await Card.create({ name, pos, idList });

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

      return card;
    },
    updateCardName: async (_: any, { input }: any, ctx: any) => {
      const { _id, name, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      const card = await Card.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { boardUpdated: board });
      return card;
    },
    updateCardPos: async (_: any, { input }: any, ctx: any) => {
      const { _id, pos, idList, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      const updateObject = { pos };
      // @ts-ignore comment
      if (idList) updateObject.idList = idList;
      const card = await Card.findOneAndUpdate(
        {
          _id,
        },
        updateObject,
        {
          new: true,
        },
      );

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

      return card;
    },
    deleteCard: async (_: any, { input }: any, ctx: any) => {
      const { _id, idBoard } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      await Card.findOneAndRemove({
        _id,
      });

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { boardUpdated: board });

      return _id;
    },
    createMember: async (_: any, { input }: any) => {
      const { fullName, password, email } = input;
      //why not just put input in? will probably need to sanitize can keep for now
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const member = await Member.create({
        fullName,
        password: hashedPassword,
        email,
      });
      const memberForToken = {
        id: member._id,
        //@ts-ignore
        email: member.email,
      };

      return {
        value: jwt.sign(memberForToken, JWT_SECRET, { expiresIn: '1h' }),
      };
    },
    inviteMember: async (_: any, { input }: any, ctx: any) => {
      //should check if member already has board/board already has member
      const { email, boardId } = input;
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(boardId)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      try {
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

        const newBoard = await getBoardById(_, { _id: boardId }, ctx);
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
    },
    removeMemberFromBoard: async (_: any, { input }: any, ctx: any) => {
      const { memberId, boardId } = input;

      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(boardId)) {
        throw new AuthenticationError('Not authorized to view this content');
      }
      //do checks on number of members/admins here? or maybe after getting board
      try {
        /////
        //this is duplicated code in next resolver
        ////
        const board = await Board.findById(boardId);

        //ensure a normal user can only leave a board, not remove another user
        const myMemberLevel = getMyMemberLevel(board, ctx.currentMember._id);
        //@ts-ignore
        // const myMemberLevel = board.members.filter(
        //   (memObj: any) =>
        //     memObj.idMember.toString() === ctx.currentMember._id.toString(),
        // )[0].memberType;

        if (
          myMemberLevel === 'normal' &&
          memberId !== ctx.currentMember._id.toString()
        ) {
          throw new AuthenticationError('Not authorized');
        }

        /////
        //duplicated code
        /////

        //cannot remove yourself if only admin
        //@ts-ignore
        const adminCount = board.members.filter(
          (obj: any) => obj.memberType === 'admin',
        ).length;
        if (
          ctx.currentMember._id.toString() === memberId &&
          myMemberLevel === 'admin' &&
          adminCount === 1
        ) {
          throw new AuthenticationError('Not authorized');
        }

        //cannot leave a board if there is only 1 user
        //@ts-ignore
        if (board.members.length === 1) {
          throw new AuthenticationError('Not authorized');
        }
        //@ts-ignore
        board.members = board.members.filter(
          (memObj: any) => memObj.idMember.toString() !== memberId,
        );

        await board.save();

        const member = await Member.findById(memberId);
        //@ts-ignore
        member.idBoards = member.idBoards.filter(
          (idBoard: any) => idBoard.toString() !== boardId,
        );

        await member.save();
        const removeObj = { memberId, boardId };

        pubsub.publish('REMOVED_FROM_BOARD', { removeFromBoard: removeObj });
        const newBoard = await getAggBoard(boardId);
        pubsub.publish('BOARD_UPDATED', { boardUpdated: newBoard });
        // const boards = await getMyBoards(_, input, ctx);
        // pubsub.publish('BOARD_LIST_UPDATED', {
        //   newBoardList: boards,
        // });

        //perhaps change what is returned?
        return memberId;
      } catch (e) {
        console.log(e);
      }
    },
    updateMemberLevelBoard: async (_: any, { input }: any, ctx: any) => {
      const { memberId, boardId, newMemberLevel } = input;

      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      }

      const myMemberInfo = await me(ctx.currentMember._id);
      //@ts-ignore
      if (!myMemberInfo.idBoards.includes(boardId)) {
        throw new AuthenticationError('Not authorized to view this content');
      }

      if (newMemberLevel !== 'admin' && newMemberLevel !== 'normal') {
        throw new ValidationError('Invalid user level');
      }

      try {
        const board = await Board.findById(boardId);

        //@ts-ignore
        const myMemberLevel = board.members.filter(
          (memObj: any) =>
            memObj.idMember.toString() === ctx.currentMember._id.toString(),
        )[0].memberType;

        //can only change if admin
        if (myMemberLevel !== 'admin') {
          throw new AuthenticationError('Not authorized');
        }
        //can only change an admin to normal if there is another admin === 2
        //@ts-ignore
        const adminCount = board.members.filter(
          (obj: any) => obj.memberType === 'admin',
        ).length;

        if (adminCount === 1 && newMemberLevel === 'normal') {
          throw new AuthenticationError('Not authorized');
        }

        await Board.findOneAndUpdate(
          { _id: boardId, 'members.idMember': memberId },
          { 'members.$.memberType': newMemberLevel },
        );
        const newBoard = await getBoardById(_, { _id: boardId }, ctx);
        pubsub.publish('BOARD_UPDATED', { boardUpdated: newBoard });

        return memberId;
      } catch (e) {
        console.log('error', e);
      }
    },
    updateMemberBoards: async (_: any, { input }: any) => {
      const { _id, boards } = input;
      //change to single board and handle updated array here
      return await Member.findOneAndUpdate(
        { _id },
        { boards },
        {
          new: true,
        },
      );
    }, //not currently used
    updateMemberPassword: async (_: any, { input }: any) => {
      const { _id, password } = input;
      return await Member.findOneAndUpdate(
        { _id },
        { password },
        {
          new: true,
        },
      );
    }, //not currently used
    deleteMember: async (_: any, { _id }: any) => {
      try {
        await Member.findOneAndRemove({
          _id,
        });
        //need to delete reference to member in all boards that contain them as a member
        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    }, //not currently used
    login: async (_: any, { input }: any) => {
      const { email, password } = input;
      const member = await Member.findOne({ email });
      //@ts-ignore
      const validPassword = await bcrypt.compare(password, member.password);

      if (!member || !validPassword) {
        throw new UserInputError('wrong credentials');
      }
      const memberForToken = {
        id: member._id,
        //@ts-ignore
        email: member.email,
      };

      return {
        value: jwt.sign(memberForToken, JWT_SECRET, { expiresIn: '1h' }),
      };
    },
  },
  Subscription: {
    newBoard: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('NEW_BOARD'),
        (payload, variables, ctx) => {
          return (
            ctx.currentMember._id.toString() ===
            payload.newBoard.memberId.toString()
          );
        },
      ),
    },
    boardUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('BOARD_UPDATED'),
        async (payload, _, ctx) => {
          try {
            const boards = await getMyBoards(null, null, ctx);
            for (const x of boards) {
              if (x._id.toString() === payload.boardUpdated[0]._id.toString())
                return true;
            }
            return false;
          } catch (e) {
            console.log(e);
          }
        },
      ),
    },
    boardDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('BOARD_DELETED'),
        (payload, variables) => {
          for (const id of variables.idBoards) {
            if (payload.boardDeleted === id) {
              return true;
            }
          }
          return false;
        },
      ),
    },
    removeFromBoard: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('REMOVED_FROM_BOARD'),
        (payload, variables, ctx) => {
          return (
            payload.removeFromBoard.memberId.toString() ===
            ctx.currentMember._id.toString()
          );
        },
      ),
    },
  },
};

export default resolvers;
