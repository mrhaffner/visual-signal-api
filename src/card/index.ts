import { gql } from 'apollo-server-express';

export const cardTypeDefs = gql`
  type Card {
    id: ID!
    content: String!
  }
`;

export const cardResolvers = {
  Query: {},
  Mutation: {},
};
