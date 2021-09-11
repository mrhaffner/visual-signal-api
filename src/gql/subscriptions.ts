import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    newBoard: [Board]
    newBoardList(memberId: ID!): [Board]
  }
`;

export default subscriptionTypeDefs;
