import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    newBoard: [List]
  }
`;

export default subscriptionTypeDefs;
