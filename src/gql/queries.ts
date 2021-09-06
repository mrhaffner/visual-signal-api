import { gql } from 'apollo-server-express';

const queryTypeDefs = gql`
  type Query {
    allBoards: [Board]
    getBoardById(_id: ID!): [Board] #
    getMemberBoards(_id: ID!): [Board]
    allLists: [List]
    getAllCards: [Card]
    getCardById(_id: ID!): Card
    getMemberByEmail(email: String!): Member
    getAllMembers: [Member]
  }
`;

export default queryTypeDefs;
