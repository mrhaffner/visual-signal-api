import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    newBoard(idBoard: ID!): [Board]
    newBoardList(memberId: ID!): [Board]
    boardDeleted: ID
  }
`;

export default subscriptionTypeDefs;
