import Joi from 'joi';

const NewBoardRules = Joi.object({
  name: Joi.string().required(),
});

export default NewBoardRules;
