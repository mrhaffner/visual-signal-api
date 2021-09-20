import Joi from 'joi';

const NewCardRules = Joi.object({
  name: Joi.string().required(),
  pos: Joi.number().required(),
  idBoard: Joi.string().required(),
  idList: Joi.string().required(),
});

export default NewCardRules;
