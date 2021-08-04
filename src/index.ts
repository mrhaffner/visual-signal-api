import express from 'express';
import mongoose from 'mongoose';
import List from './list/model';
import Card from './card/model';

import { ApolloServer, gql } from 'apollo-server-express';

const typeDefs = gql`
  type Board {
    Lists: [List]
  }

  type List {
    _id: ID!
    title: String!
    index: Int!
    cards: [Card]
  }

  type Card {
    _id: ID!
    content: String!
    listId: String!
    index: Int!
  }

  type Query {
    allLists: [List]
    getAllCards: [Card]
    getCardById(_id: ID!): Card
  }

  type Mutation {
    createList(title: String!, index: Int!): List
    updateList(_id: ID!, title: String, index: Int): List
    deleteList(_id: ID!): ID
    createCard(content: String!, index: Int!, listId: String!): Card
    updateCard(_id: ID!, content: String, index: Int, listId: String): Card
    deleteCard(_id: ID!): ID
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
            foreignField: 'listId',
            pipeline: [
              {
                $sort: { index: 1 },
              },
            ],
            as: 'cards',
          },
        },
      ]).sort('index');
      return lists;
    },
    //probably don't need this except for testing
    getAllCards: async () => {
      return await Card.find();
    },
    getCardById: async (_: any, { _id }: any) => {
      const card = await Card.find({ _id });
      return card[0];
    },
  },
  Mutation: {
    createList: async (_: any, { title, index }: any) => {
      return await List.create({ title, index });
    },
    updateList: async (_: any, { _id, title, index }: any) => {
      return await List.findOneAndUpdate(
        {
          _id,
        },
        { title, index },
        {
          new: true,
        },
      );
    },
    deleteList: async (_: any, { _id }: any) => {
      await List.findOneAndRemove({
        _id,
      });
      return _id;
    },
    createCard: async (_: any, { content, index, listId }: any) => {
      return await Card.create({ content, index, listId });
    },
    //might want a seperate update function for changing card content vs position (with maybe listId depending on if it changes lists) so content/position can be required fields
    updateCard: async (_: any, { _id, content, index, listId }: any) => {
      return await Card.findOneAndUpdate(
        {
          _id,
        },
        { content, index, listId },
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
