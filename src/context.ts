import Member from './models/member';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
//invalid token, then what? just a error? front end probably needs to delete and try to reauthenticate
//does this need to update constantly? is it subscriptions?
const context = async ({ req }: any) => {
  const auth = req ? req.headers.authorization : null;

  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    // try {
    const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);

    //@ts-ignore
    const currentMember = await Member.findById(decodedToken.id);

    return { currentMember };
    // } catch (e) {
    //   console.log(e);
    // }
  }
};

// jwt.verify(auth.substring(7), JWT_SECRET, async (e: any, decoded: any) => {
//   if (e) {
//     return e;
//   }
//   const currentMember = await Member.findById(decoded.id);
//   return { currentMember };
// });
export default context;
