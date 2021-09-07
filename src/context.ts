import Member from './models/member';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
//invalid token, then what? just a fucking error?
//does this need to update constantly? is it subscriptions?
const context = async ({ req }: any) => {
  const auth = req ? req.headers.authorization : null;

  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
    //@ts-ignore
    const currentMember = await Member.findById(decodedToken.id);
    return { currentMember };
  }
};

export default context;