import { UserInputError } from 'apollo-server-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Member from '../../../../models/member';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const login = async (_: any, { input }: any) => {
  try {
    const { email, password } = input;
    const member = await Member.findOne({ email });
    //@ts-ignore
    const validPassword = await bcrypt.compare(password, member.password);

    if (!member || !validPassword) {
      throw new UserInputError('wrong credentials');
    }

    const memberForToken = {
      id: member._id,
      //@ts-ignore
      email: member.email,
    };

    return {
      value: jwt.sign(memberForToken, JWT_SECRET, { expiresIn: '1h' }),
    };
  } catch (e) {
    console.log(e);
  }
};

export default login;
