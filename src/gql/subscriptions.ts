import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    boardUpdated: [Board]
    newBoardList(memberId: ID!): [Board]
    boardDeleted(idBoards: [ID!]!): ID
  }
`;

export default subscriptionTypeDefs;
