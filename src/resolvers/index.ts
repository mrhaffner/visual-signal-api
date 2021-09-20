import mutations from './mutations';
import subscriptions from './subscriptions';
import queries from './queries';

const resolvers = {
  Query: {
    ...queries,
  },
  Mutation: {
    ...mutations,
  },
  Subscription: {
    ...subscriptions,
  },
};

export default resolvers;
