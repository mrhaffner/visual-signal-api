import { gql } from 'apollo-server-express';
import queryTypeDefs from './queries';
import mutationTypeDefs from './mutations';
import subscriptionTypeDefs from './subscriptions';
import schemaTypes from './schemaTypes';

const typeDefs = gql`
  ${schemaTypes}
  ${queryTypeDefs}
  ${mutationTypeDefs}
  ${subscriptionTypeDefs}
`;

export default typeDefs;
