import express from 'express';
import mongoose from 'mongoose';
import Column from './column/model';

import { ApolloServer, gql } from 'apollo-server-express';

const typeDefs = gql`
  type Board {
    columns: [Column]
  }

  type Column {
    _id: ID!
    title: String!
    index: Int!
    cards: [Card]
  }

  type Card {
    _id: ID!
    content: String!
  }

  type Query {
    allColumns: [Column]
  }

  input ColumnCreateInput {
    title: String!
    index: Int!
  }

  input ColumnUpdateInput {
    title: String
    index: Int
  }

  type Mutation {
    createColumn(input: ColumnCreateInput): Column
    updateColumn(_id: ID!, input: ColumnUpdateInput): Column
    deleteColumn(_id: ID!): ID
  }
`;

const resolvers = {
  Query: {
    allColumns: async () => {
      return await Column.find();
    },
  },
  Mutation: {
    createColumn: async (_: any, { input }: any) => {
      return await Column.create(input);
    },
    updateColumn: async (_: any, { _id, input }: any) => {
      return await Column.findOneAndUpdate(
        {
          _id,
        },
        input,
        {
          new: true,
        },
      );
    },
    deleteColumn: async (_: any, { _id }: any) => {
      await Column.findOneAndRemove({
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
