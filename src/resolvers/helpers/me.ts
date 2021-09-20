import Member from '../../models/member';

const me = async (id: string) => {
  return await Member.findById(id);
};

export default me;
