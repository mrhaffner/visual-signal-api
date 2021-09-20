import Joi from 'joi';

const NewNameRules = Joi.object({
  name: Joi.string().required(),
});

export default NewNameRules;
