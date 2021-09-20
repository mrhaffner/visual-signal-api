import * as boardQueries from './board';
import * as memberQueries from './member';
import * as devOnlyQueries from './devOnly';

const queries = { ...boardQueries, ...memberQueries, ...devOnlyQueries };

export default queries;
