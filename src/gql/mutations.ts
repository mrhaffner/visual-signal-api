import { gql } from 'apollo-server-express';

const mutationTypeDefs = gql`
  type Mutation {
    createBoard(input: CreateBoard!): Board
    updateBoard(input: UpdateBoardInput!): Board
    deleteBoard(_id: ID!): ID
    createList(input: CreateList!): List
    updateListPos(input: UpdateListPosInput!): List
    deleteList(_id: ID!): ID
    createCard(input: CreateCard!): Card
    updateCardPos(input: UpdateCardPosInput!): Card
    deleteCard(_id: ID!): ID
  }

  input CreateBoard {
    name: String!
  }

  input UpdateBoardInput {
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
  }

  input CreateCard {
    name: String!
    pos: Float!
    idList: String!
  }

  input UpdateCardPosInput {
    _id: ID!
    pos: Float!
    idList: String
  }
`;

export default mutationTypeDefs;
