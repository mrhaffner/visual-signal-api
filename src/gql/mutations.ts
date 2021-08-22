import { gql } from 'apollo-server-express';

const mutationTypeDefs = gql`
  type Mutation {
    createList(input: CreateList!): List
    updateListPos(input: UpdateListPosInput!): List
    deleteList(_id: ID!): ID
    createCard(input: CreateCard!): Card
    updateCardPos(input: UpdateCardPosInput!): Card
    deleteCard(_id: ID!): ID
  }

  input CreateList {
    name: String!
    pos: Float!
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
