import Member from '../../../models/member';

export const updateMemberBoards = async (_: any, { input }: any) => {
  const { _id, boards } = input;
  //change to single board and handle updated array here
  return await Member.findOneAndUpdate(
    { _id },
    { boards },
    {
      new: true,
    },
  );
};
export const updateMemberPassword = async (_: any, { input }: any) => {
  const { _id, password } = input;
  return await Member.findOneAndUpdate(
    { _id },
    { password },
    {
      new: true,
    },
  );
};
export const deleteMember = async (_: any, { _id }: any) => {
  try {
    await Member.findOneAndRemove({
      _id,
    });
    //need to delete reference to member in all boards that contain them as a member
    return _id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
