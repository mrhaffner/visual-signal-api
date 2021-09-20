import Member from '../../models/member';

const me = async (id: string) => {
  const member = await Member.findById(id);
  const memObj = member.toObject();
  //@ts-ignore
  delete memObj.password;
  return memObj;
};

export default me;
