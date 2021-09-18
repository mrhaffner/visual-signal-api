import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    boardUpdated: [Board]
    newBoardList(memberId: ID!): [Board]
    boardDeleted(idBoards: [ID!]!): ID
    removeFromBoard: RemoveMemberObject
  }

  type RemoveMemberObject {
    memberId: ID!
    boardId: ID!
  }
`;

export default subscriptionTypeDefs;
