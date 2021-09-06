import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    newBoard: [Board] #
  }
`;

export default subscriptionTypeDefs;
