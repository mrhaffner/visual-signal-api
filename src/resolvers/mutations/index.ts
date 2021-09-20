import boardMutations from './board';
import cardMutations from './card';
import listMutations from './list';
import memberMutations from './member';

const mutations = {
  ...boardMutations,
  ...listMutations,
  ...cardMutations,
  ...memberMutations,
};

export default mutations;
