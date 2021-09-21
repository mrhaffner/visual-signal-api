import jwt from 'jsonwebtoken';
import Member from './models/member';
import dotenv from 'dotenv';
import { ExecutionParams } from 'subscriptions-transport-ws';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// const onOperation = async (message: any, connection: ExecutionParams) => {
//   connection.formatResponse = (value: ) => ({
//     ...value,
//     errors:
//       value.errors &&
//       formatApolloErrors([...value.errors], {
//         formatter: this.requestOptions.formatError,
//         debug: this.requestOptions.debug,
//       }),
//   });
//   let context: Context = this.context ? this.context : { connection };

//   try {
//     context =
//       typeof this.context === 'function'
//         ? await this.context({ connection, payload: message.payload })
//         : context;

// export default onOperation;
