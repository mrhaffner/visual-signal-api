import { PubSub, withFilter } from 'graphql-subscriptions';
import List from '../models/list';
import Card from '../models/card';
import Board from '../models/board';
import Member from '../models/member';
import { getBoardById, getMyBoards } from './controllers';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const pubsub = new PubSub();
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
    getMyMemberInfo: async (_: any, __: any, ctx: any) => {
      //make this so it only returs the needed fields, definitely not password
      return ctx.currentMember;
    },
    getAllMembers: async () => {
      return await Member.find();
    }, //for testing only
    getMemberByEmail: async (_: any, { email }: any) => {
      return await Member.findOne({ email });
    }, //may be used in the future, probably needs a version for admins and non admids or some sort of auth
  },
  Mutation: {
    createBoard: async (_: any, { name }: any, ctx: any) => {
      if (!ctx.currentMember) {
        throw new AuthenticationError('Not authenticated');
      } ////work here
      const idMemberCreator = ctx.currentMember._id;
      //create new doc then save?
      const members = [{ idMember: idMemberCreator, memberType: 'owner' }];
      const board = await Board.create({
        name,
        idMemberCreator,
        members,
      });
      // const member = await Member.findById(idMemberCreator);
      const member = ctx.currentMember;
      // @ts-ignore comment
      member.idBoards.push(board._id);
      await member.save();

      const boards = await getMyBoards(_, name, ctx);

      pubsub.publish('BOARD_LIST_UPDATED', { newBoardList: boards });
      return board;
    },
    updateBoardName: async (_: any, { input }: any, ctx: any) => {
      const { _id, name } = input;

      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(_id)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      await Board.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
      //these are repeated make them their own functions or a hook?
      const board = await getBoardById(_, { _id }, ctx);
      pubsub.publish('BOARD_UPDATED', { newBoard: board });
      const boards = await getMyBoards(_, input, ctx);
      pubsub.publish('BOARD_LIST_UPDATED', { newBoardList: boards });
      return board;
    },
    deleteBoard: async (_: any, { _id }: any, ctx: any) => {
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(_id)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      try {
        //do I need to populate subdoc?
        const board = await Board.findById(_id);
        // @ts-ignore comment
        const boardMembers = board.members;

        for await (const mem of boardMembers) {
          const memberId = mem.idMember;
          const member = await Member.findById(memberId);
          // @ts-ignore comment
          const memberBoards = member.idBoards;
          const newBoards = memberBoards.filter(
            (x: any) => x.toString() !== _id,
          );
          // @ts-ignore comment
          member.idBoards = newBoards;
          member.save();
        }

        await Board.findOneAndRemove({
          _id,
        });
        pubsub.publish('BOARD_UPDATED', { newBoard: [] });
        const boards = await getMyBoards(_, _id, ctx);
        pubsub.publish('BOARD_LIST_UPDATED', { newBoardList: boards });
        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    createList: async (_: any, { input }: any, ctx: any) => {
      const { name, pos, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      const list = await List.create({ name, pos, idBoard });

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return list;
    },
    updateListName: async (_: any, { input }: any, ctx: any) => {
      const { _id, name, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      const list = await List.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );

      const board = await getBoardById(_, { _id: idBoard }, ctx);

      pubsub.publish('BOARD_UPDATED', { newBoard: board });
      return list;
    },
    updateListPos: async (_: any, { input }: any, ctx: any) => {
      const { _id, pos, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      const list = await List.findOneAndUpdate(
        { _id },
        { pos },
        {
          new: true,
        },
      );

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return list;
    },
    deleteList: async (_: any, { input }: any, ctx: any) => {
      const { _id, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      try {
        await List.findOneAndRemove({
          _id,
        });

        const board = await getBoardById(_, { _id: idBoard }, ctx);
        pubsub.publish('BOARD_UPDATED', { newBoard: board });

        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    createCard: async (_: any, { input }: any, ctx: any) => {
      const { name, pos, idList, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      const card = await Card.create({ name, pos, idList });

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return card;
    },
    updateCardName: async (_: any, { input }: any, ctx: any) => {
      const { _id, name, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      const card = await Card.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { newBoard: board });
      return card;
    },
    updateCardPos: async (_: any, { input }: any, ctx: any) => {
      const { _id, pos, idList, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
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
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return card;
    },
    deleteCard: async (_: any, { input }: any, ctx: any) => {
      const { _id, idBoard } = input;
      if (!ctx.currentMember || !ctx.currentMember.idBoards.includes(idBoard)) {
        throw new AuthenticationError('Not authenticated or authorized');
      }
      await Card.findOneAndRemove({
        _id,
      });

      const board = await getBoardById(_, { _id: idBoard }, ctx);
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

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
    newBoardList: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('BOARD_LIST_UPDATED'),
        (payload, variables) => {
          //O(n^2) lmao
          //perhaps this subscriptions returns a single Board and on the front the cache is updated based on the board returned?
          //that would require a different subscription though for delete, update and add...
          for (const x of payload.newBoardList) {
            for (const y of x.members) {
              if (y.idMember.toString() === variables.memberId) return true;
            }
          }
          return false;
        },
      ),
    },
    newBoard: {
      subscribe: () => pubsub.asyncIterator(['BOARD_UPDATED']),
    },
    // newBoard: {
    //   subscribe: () => pubsub.asyncIterator(['BOARD_UPDATED']),
    // },
    // newBoardList: {
    //   subscribe: () => pubsub.asyncIterator(['BOARD_LIST_UPDATED']),
    // },
  },
};

export default resolvers;
