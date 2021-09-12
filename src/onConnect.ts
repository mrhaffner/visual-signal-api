import jwt from 'jsonwebtoken';
import Member from './models/member';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const onConnect = async (params: any, webSocket: any) => {
  if (params.authorization) {
    const decodedToken = jwt.verify(
      params.authorization.substring(7),
      JWT_SECRET,
    );
    //@ts-ignore
    const currentMember = await Member.findById(decodedToken.id);

    return { currentMember };
  }
};

export default onConnect;
