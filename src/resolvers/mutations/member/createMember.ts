import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Member from '../../../models/member';
import dotenv from 'dotenv';
import NewMemberRules from '../../../validations/member';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const createMember = async (_: any, { input }: any) => {
  try {
    await NewMemberRules.validateAsync(input);
    const { fullName, password, email } = input;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const member = await Member.create({
      fullName,
      password: hashedPassword,
      email,
    });

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

export default createMember;
