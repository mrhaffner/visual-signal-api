import { gql } from 'apollo-server-express';

const queryTypeDefs = gql`
  type Query {
    allBoards: [Board]
    getBoardById(_id: ID!): Board
    allLists: [List]
    getAllCards: [Card]
    getCardById(_id: ID!): Card
    getMemberById(_id: ID!): Member
    getAllMembers: [Member]
  }
`;

export default queryTypeDefs;
