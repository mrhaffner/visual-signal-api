import { gql } from 'apollo-server-express';

const schemaTypes = gql`
  type Card {
    _id: ID!
    name: String!
    pos: Float!
    idList: String!
  }

  type List {
    _id: ID!
    name: String!
    pos: Float!
    cards: [Card]
  }
`;

export default schemaTypes;
