import me from '../helpers/me';
import Member from '../../../models/member';
import EmailRules from '../validations/email';

export const getMyMemberInfo = async (
  _: any,
  __: any,
  { currentMember }: any,
) => {
  try {
    return await me(currentMember._id);
  } catch (e) {
    console.log(e);
  }
};

export const validateEmail = async (_: any, { email }: any) => {
  try {
    await EmailRules.validateAsync({ email });

    const memberCheck = await Member.findOne({ email });

    return !!!memberCheck;
  } catch (e) {
    console.log(e);
  }
};
