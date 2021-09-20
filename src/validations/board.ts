import Joi from 'joi';

const NewBoardRules = Joi.object({
  name: Joi.string().max(30).required(),
});

export default NewBoardRules;
