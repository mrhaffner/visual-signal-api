import { createServer } from 'http';
import express from 'express';
import { execute, subscribe } from 'graphql';
import { ApolloServer } from 'apollo-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import mongoose from 'mongoose';
import typeDefs from './gql/typeDefs';
import resolvers from './gql/resolvers';
import context from './context';
import onConnect from './onConnect';
// import onOperation from './onOperation';
import mongoSanitize from 'express-mongo-sanitize';

(async () => {
  const PORT = 8080;
  const app = express();
  app.use(mongoSanitize());
  const httpServer = createServer(app);

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

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context,
  });
  await server.start();
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect,
      // onOperation,
      // onOperation: (message: any, params: any, webSocket: any) => {
      //   // console.log(message);
      //   // console.log(params);
      //   console.log(webSocket.upgradeReq);

      //   return { ...params, context: { user: 'me' } };
      // },
    },
    { server: httpServer, path: server.graphqlPath },
  );

  httpServer.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
})();
