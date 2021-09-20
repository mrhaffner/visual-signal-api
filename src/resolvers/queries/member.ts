import me from '../helpers/me';

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
