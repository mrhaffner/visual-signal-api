import Joi from 'joi';

const NewListRules = Joi.object({
  name: Joi.string().required(),
  pos: Joi.number().required(),
  idBoard: Joi.string().required(),
});

export default NewListRules;
