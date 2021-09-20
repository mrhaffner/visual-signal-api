import boardMutations from './board';
import cardMutations from './card';
import listMutations from './list';
import memberMutations from './member';
import * as devOnlyMutations from './devOnly';

const mutations = {
  ...boardMutations,
  ...listMutations,
  ...cardMutations,
  ...memberMutations,
  ...devOnlyMutations,
};

export default mutations;
