import Member from '../../../models/member';

const me = async (id: string) => {
  try {
    const member = await Member.findById(id, { password: 0 });
    return member;
  } catch (e) {
    console.log(e);
  }
};

export default me;
