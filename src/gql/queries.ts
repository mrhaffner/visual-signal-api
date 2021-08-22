import { gql } from 'apollo-server-express';

const queryTypeDefs = gql`
  type Query {
    allLists: [List]
    getAllCards: [Card]
    getCardById(_id: ID!): Card
  }
`;

export default queryTypeDefs;
