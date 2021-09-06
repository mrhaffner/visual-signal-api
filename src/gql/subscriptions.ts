import { gql } from 'apollo-server-express';

const subscriptionTypeDefs = gql`
  type Subscription {
    newBoard: [Board]
    newBoardList: [Board]
  }
`;

export default subscriptionTypeDefs;
