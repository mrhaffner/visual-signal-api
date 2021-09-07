import { gql } from 'apollo-server-express';

const schemaTypes = gql`
  enum MemberType {
    normal
    admin
    owner
  }

  type MemberInfo {
    idMember: ID!
    memberType: MemberType!
  }

  type Board {
    _id: ID!
    name: String!
    lists: [List]
    idMemberCreator: String!
    members: [MemberInfo]
  }

  type List {
    _id: ID!
    name: String!
    pos: Float!
    idBoard: String!
    cards: [Card]
  }

  type Card {
    _id: ID!
    name: String!
    pos: Float!
    idList: String!
  }

  type Member {
    _id: ID!
    fullName: String!
    password: String! # uh what to do with this? hash that
    initials: String
    username: String
    idBoards: [ID]
    email: String!
  }

  type Token {
    value: String!
  }
`;

export default schemaTypes;
