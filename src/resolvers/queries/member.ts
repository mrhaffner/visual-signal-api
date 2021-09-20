import me from '../helpers/me';

export const getMyMemberInfo = async (
  _: any,
  __: any,
  { currentMember }: any,
) => {
  return await me(currentMember._id);
  try {
  } catch (e) {
    console.log(e);
  }
  //make this so it only returs the needed fields, definitely not password
  // return ctx.currentMember;
};
