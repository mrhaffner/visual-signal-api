import { gql } from 'apollo-server-express';

const queryTypeDefs = gql`
  type Query {
    allBoards: [Board]
    getBoardById(_id: ID!): [Board]
    getMyBoards: [Board]
    allLists: [List]
    getAllCards: [Card]
    getCardById(_id: ID!): Card
    getMyMemberInfo: Member
    getMemberByEmail(email: String!): Member
    getAllMembers: [Member]
    validateEmail(email: String!): Boolean
  }
`;

export default queryTypeDefs;
