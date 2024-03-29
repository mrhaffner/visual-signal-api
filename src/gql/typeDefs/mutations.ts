import { gql } from 'apollo-server-express';

const mutationTypeDefs = gql`
  type Mutation {
    createBoard(input: CreateBoardInput!): Board
    updateBoardName(input: UpdateBoardNameInput!): [Board]
    deleteBoard(_id: ID!): ID
    createList(input: CreateList!): List
    updateListPos(input: UpdateListPosInput!): List
    updateListName(input: UpdateListNameInput!): List
    deleteList(input: DeleteList!): ID
    createCard(input: CreateCard!): Card
    updateCardPos(input: UpdateCardPosInput!): Card
    updateCardName(input: UpdateCardNameInput!): Card
    deleteCard(input: DeleteCard!): ID
    createMember(input: CreateMember!): Token
    inviteMember(input: InviteMemberInput!): Member
    removeMemberFromBoard(input: RemoveMemberInput!): ID
    updateMemberLevelBoard(input: UpdateMemberLevelInput!): ID
    updateMemberBoards(input: UpdateMemberBoardInput!): Member
    updateMemberPassword(input: UpdateMemberPasswordInput!): Member
    deleteMember(_id: ID!): ID
    login(input: LoginInput!): Token
  }

  input CreateBoardInput {
    name: String!
    color: BoardColor
  }

  input UpdateBoardNameInput {
    _id: ID!
    name: String!
  }

  input CreateList {
    name: String!
    pos: Float!
    idBoard: String!
  }

  input UpdateListPosInput {
    _id: ID!
    pos: Float!
    idBoard: String!
  }

  input UpdateListNameInput {
    _id: ID!
    name: String!
    idBoard: String!
  }

  input DeleteList {
    _id: ID!
    idBoard: String!
  }

  input CreateCard {
    name: String!
    pos: Float!
    idList: String!
    idBoard: String!
  }

  input UpdateCardPosInput {
    _id: ID!
    pos: Float!
    idList: String
    idBoard: String!
  }

  input UpdateCardNameInput {
    _id: ID!
    name: String!
    idBoard: String!
  }

  input DeleteCard {
    _id: ID!
    idBoard: String!
  }

  input CreateMember {
    fullName: String!
    password: String! # uh what to do with this? hash it
    email: String!
  }

  input InviteMemberInput {
    email: String!
    boardId: ID!
  }

  input UpdateMemberBoardInput {
    _id: ID!
    boards: [String]! #change to single board, let back handle
  }

  input UpdateMemberPasswordInput {
    _id: ID!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RemoveMemberInput {
    memberId: ID!
    boardId: ID!
  }

  input UpdateMemberLevelInput {
    memberId: ID!
    boardId: ID!
    newMemberLevel: String!
  }
`;

export default mutationTypeDefs;
