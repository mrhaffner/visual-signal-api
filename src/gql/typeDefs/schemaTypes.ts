import { gql } from 'apollo-server-express';

const schemaTypes = gql`
  enum MemberType {
    normal
    admin
    owner
  }

  enum BoardColor {
    blue
    orange
    green
    red
    purple
    pink
    lime
    sky
    grey
  }

  type MemberInfo {
    idMember: ID!
    memberType: MemberType!
    fullName: String!
    username: String!
    initials: String!
  }

  type Board {
    _id: ID!
    name: String!
    lists: [List]
    idMemberCreator: String!
    members: [MemberInfo]
    color: BoardColor
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
    idBoard: String!
  }

  type Member {
    _id: ID!
    fullName: String!
    password: String!
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
