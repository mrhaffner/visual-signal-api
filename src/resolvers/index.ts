import { PubSub } from 'graphql-subscriptions';
import List from '../models/list';
import Card from '../models/card';
import Board from '../models/board';
import Member from '../models/member';
import { getBoardById, getMemberBoards } from './controllers';

const pubsub = new PubSub();

const resolvers = {
  Query: {
    allBoards: async () => {
      return await Board.find();
    },
    getBoardById,
    getMemberBoards,
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
    },
    //probably don't need this except for testing
    getAllCards: async () => {
      return await Card.find();
    },
    getCardById: async (_: any, { _id }: any) => {
      return await Card.findOne({ _id });
    },
    getAllMembers: async () => {
      return await Member.find();
    },
    getMemberByEmail: async (_: any, { email }: any) => {
      return await Member.findOne({ email });
    },
  },
  Mutation: {
    createBoard: async (_: any, { input }: any) => {
      const { name, idMemberCreator } = input;
      //create new doc then save?
      const members = [{ idMember: idMemberCreator, memberType: 'owner' }];
      const board = await Board.create({ name, idMemberCreator, members });
      const member = await Member.findById(idMemberCreator);
      // @ts-ignore comment
      member.idBoards.push(board._id);
      await member.save();

      const boards = await getMemberBoards(_, { _id: idMemberCreator });
      pubsub.publish('BOARD_LIST_UPDATED', { newBoardList: boards });
      return board;
      //needs to update board list via pubsub
    },
    updateBoardName: async (_: any, { input }: any) => {
      const { _id, name, idMember } = input;
      await Board.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
      const board = await getBoardById(_, { _id });
      pubsub.publish('BOARD_UPDATED', { newBoard: board });
      const boards = await getMemberBoards(_, { _id: idMember });
      pubsub.publish('BOARD_LIST_UPDATED', { newBoardList: boards });
      return board;
    },
    deleteBoard: async (_: any, { _id }: any) => {
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
        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    createList: async (_: any, { input }: any) => {
      const { name, pos, idBoard } = input;
      const list = await List.create({ name, pos, idBoard });

      const board = await getBoardById(_, { _id: idBoard });
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return list;
    },
    updateListName: async (_: any, { input }: any) => {
      const { _id, name, idBoard } = input;
      const list = await List.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );

      const board = await getBoardById(_, { _id: idBoard });

      pubsub.publish('BOARD_UPDATED', { newBoard: board });
      return list;
    },
    updateListPos: async (_: any, { input }: any) => {
      const { _id, pos, idBoard } = input;
      const list = await List.findOneAndUpdate(
        { _id },
        { pos },
        {
          new: true,
        },
      );

      const board = await getBoardById(_, { _id: idBoard });
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return list;
    },
    deleteList: async (_: any, { input }: any) => {
      const { _id, idBoard } = input;
      try {
        await List.findOneAndRemove({
          _id,
        });

        const board = await getBoardById(_, { _id: idBoard });
        pubsub.publish('BOARD_UPDATED', { newBoard: board });

        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    createCard: async (_: any, { input }: any) => {
      const { name, pos, idList, idBoard } = input;
      const card = await Card.create({ name, pos, idList });

      const board = await getBoardById(_, { _id: idBoard });
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return card;
    },
    updateCardName: async (_: any, { input }: any) => {
      const { _id, name, idBoard } = input;
      const card = await Card.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
      const board = await getBoardById(_, { _id: idBoard });
      pubsub.publish('BOARD_UPDATED', { newBoard: board });
      return card;
    },
    updateCardPos: async (_: any, { input }: any) => {
      const { _id, pos, idList, idBoard } = input;
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

      const board = await getBoardById(_, { _id: idBoard });
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return card;
    },
    deleteCard: async (_: any, { input }: any) => {
      const { _id, idBoard } = input;
      await Card.findOneAndRemove({
        _id,
      });

      const board = await getBoardById(_, { _id: idBoard });
      pubsub.publish('BOARD_UPDATED', { newBoard: board });

      return _id;
    },
    createMember: async (_: any, { input }: any) => {
      const { fullName, password, email } = input;
      //why not just put input in? will probably need to sanitize can keep for now
      return await Member.create({ fullName, password, email });
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
    },
    updateMemberPassword: async (_: any, { input }: any) => {
      const { _id, password } = input;
      return await Member.findOneAndUpdate(
        { _id },
        { password },
        {
          new: true,
        },
      );
    },
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
    },
  },
  Subscription: {
    newBoard: {
      subscribe: () => pubsub.asyncIterator(['BOARD_UPDATED']),
    },
    newBoardList: {
      subscribe: () => pubsub.asyncIterator(['BOARD_LIST_UPDATED']),
    },
  },
};

export default resolvers;
