import { gql } from 'apollo-server-express';

const mutationTypeDefs = gql`
  type Mutation {
    createBoard(input: CreateBoard!): Board
    updateBoardName(input: UpdateBoardNameInput!): Board
    deleteBoard(_id: ID!): ID
    createList(input: CreateList!): List
    updateListPos(input: UpdateListPosInput!): List
    deleteList(input: DeleteList!): ID
    createCard(input: CreateCard!): Card
    updateCardPos(input: UpdateCardPosInput!): Card
    deleteCard(input: DeleteCard!): ID
  }

  input CreateBoard {
    name: String!
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

  input DeleteCard {
    _id: ID!
    idBoard: String!
  }
`;

export default mutationTypeDefs;
