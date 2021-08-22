import { PubSub } from 'graphql-subscriptions';
import List from '../models/list';
import Card from '../models/card';

const pubsub = new PubSub();

const resolvers = {
  Query: {
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
    createList: async (_: any, { input }: any) => {
      const { name, pos } = input;
      return await List.create({ name, pos });
    },
    updateListPos: async (_: any, { input }: any) => {
      const { _id, pos } = input;
      const list = await List.findOneAndUpdate(
        { _id },
        { pos },
        {
          new: true,
        },
      );

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
      pubsub.publish('BOARD_UPDATED', { newBoard: lists });

      return list;
    },
    deleteList: async (_: any, { _id }: any) => {
      try {
        await List.findOneAndRemove({
          _id,
        });
        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    createCard: async (_: any, { input }: any) => {
      const { name, pos, idList } = input;
      return await Card.create({ name, pos, idList });
    },
    //might want a seperate update function for changing card content vs position (with maybe listId depending on if it changes lists) so content/position can be required fields
    updateCardPos: async (_: any, { input }: any) => {
      const { _id, pos, idList } = input;
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
      pubsub.publish('BOARD_UPDATED', { newBoard: lists });

      return card;
    },
    deleteCard: async (_: any, { _id }: any) => {
      await Card.findOneAndRemove({
        _id,
      });
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
