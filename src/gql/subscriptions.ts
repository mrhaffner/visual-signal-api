import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    newBoard(idBoard: ID!): [Board]
    newBoardList(memberId: ID!): [Board]
  }
`;

export default subscriptionTypeDefs;
