// import { gql } from 'apollo-server-express';
// import Column from './model';

// export const columnTypeDefs = gql`
//   type Column {
//     id: ID!
//     title: String!
//     index: Int!
//     cards: [Card]
//   }

//   extend type Query {
//     allColumns: [Column]
//   }

//   input ColumnCreateInput {
//     title: String!
//     index: Int!
//   }

//   input ColumnUpdateInput {
//     id: ID!
//     title: String
//     index: Int
//   }

//   type Mutation {
//     createColumn(input: ColumnCreateInput): Column
//     updateColumn(_id: ID!, input: ColumnUpdateInput): Column
//     deleteColumn(_id: ID!): Column
//   }
// `;

// export const columnResolvers = {
//   Query: {
//     async allColumns() {
//       return await Column.find();
//     },
//   },
//   Mutation: {
//     async createColumn(root, { input }) {
//       return await Column.create(input);
//     },
//     async updateColumnTitle(root, { _id, input }) {
//       return await Column.findOneAndUpdate(
//         {
//           _id,
//         },
//         input,
//         {
//           new: true,
//         },
//       );
//     },
//     async deleteColumn(root, { _id }) {
//       return await Column.findOneAndRemove({
//         _id,
//       });
//     },
//   },
// };
