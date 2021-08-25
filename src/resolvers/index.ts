import { PubSub } from 'graphql-subscriptions';
import List from '../models/list';
import Card from '../models/card';
import Board from '../models/board';
import mongoose from 'mongoose';
import { getBoardById } from './controllers';

const ObjectId = mongoose.Types.ObjectId;
const pubsub = new PubSub();

const resolvers = {
  Query: {
    allBoards: async () => {
      return await Board.find();
    },
    getBoardById,
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
  },
  Mutation: {
    createBoard: async (_: any, { input }: any) => {
      const { name } = input;
      return await Board.create({ name });
    },
    updateBoardName: async (_: any, { input }: any) => {
      const { _id, name } = input;
      return await Board.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
    },
    deleteBoard: async (_: any, { _id }: any) => {
      try {
        await Board.findOneAndRemove({
          _id,
        });
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
      const { _id, name } = input;
      return await List.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
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
      const { _id, name } = input;
      return await Card.findOneAndUpdate(
        { _id },
        { name },
        {
          new: true,
        },
      );
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
  },
  Subscription: {
    newBoard: {
      subscribe: () => pubsub.asyncIterator(['BOARD_UPDATED']),
    },
  },
};

export default resolvers;
