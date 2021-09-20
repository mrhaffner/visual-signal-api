const getMyMemberLevel = (board: any, myId: string) => {
  return board.members.filter(
    (memObj: any) => memObj.idMember.toString() === myId.toString(),
  )[0].memberType;
};

export default getMyMemberLevel;
