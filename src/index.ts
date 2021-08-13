import express from 'express';
import mongoose from 'mongoose';
import List from './list/model';
import Card from './card/model';

import { ApolloServer, gql } from 'apollo-server-express';

const typeDefs = gql`

  type List {
    _id: ID!
    name: String!
    pos: Int!
    cards: [Card]
  }

  type Card {
    _id: ID!
    name: String!
    pos: Int!
    idList: String!
  }

  type Query {
    allLists: [List]
    getAllCards: [Card]
    getCardById(_id: ID!): Card
  }

  type Mutation {
    createList(input: CreateList!): List
    updateList(input: UpdateList!): List
    deleteList(_id: ID!): ID
    createCard(input: CreateCard!): Card
    updateCard(input: UpdateCard!): Card
    deleteCard(_id: ID!): ID
  }

  input CreateList {
    name: String!
    pos: Int!
  }

  input UpdateList {
    _id: ID!
    name: String
    pos: Int
  }

  input CreateCard {
    name: String!
    pos: Int!
    idList: String!
  }

  input UpdateCard {
    _id: ID!
    name: String
    pos: Int
    idList: String!
  }
`;

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
    updateList: async (_: any, { input }: any) => {
      const { _id, name, pos } = input;
      return await List.findOneAndUpdate(
        {
          _id,
        },
        { name, pos },
        {
          new: true,
        },
      );
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
    updateCard: async (_: any, { input }: any) => {
      const { _id, name, pos, idList } = input;
      return await Card.findOneAndUpdate(
        {
          _id,
        },
        { name, pos, idList },
        {
          new: true,
        },
      );
    },
    deleteCard: async (_: any, { _id }: any) => {
      await Card.findOneAndRemove({
        _id,
      });
      return _id;
    },
  },
};

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connected to Mongo');
});

const startServer = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  const app = express();
  await server.start();
  server.applyMiddleware({ app });

  // app.get('/', (req, res) => {
  //   console.log('Apollo GraphQL server is ready');
  // });

  const port = 8080;

  app.listen({ port }, () => {
    console.log(`Server is running at port: ${port}`);
  });
};

startServer();
