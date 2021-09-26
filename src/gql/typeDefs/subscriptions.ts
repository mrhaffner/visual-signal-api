import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    boardUpdated: [Board]
    boardDeleted(idBoards: [ID!]!): ID
    removeFromBoard: RemoveMemberObject
    newBoard: NewBoardObject
  }

  type RemoveMemberObject {
    memberId: ID!
    boardId: ID!
  }

  type NewBoardObject {
    memberId: ID!
    boardObj: BoardListObject!
  }

  type BoardListObject {
    _id: ID!
    name: String!
    color: BoardColor
  }
`;

export default subscriptionTypeDefs;
