import { gql } from 'apollo-server-express';

const schemaTypes = gql`
  type Board {
    _id: ID!
    name: String!
    lists: [List]
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
`;

export default schemaTypes;
