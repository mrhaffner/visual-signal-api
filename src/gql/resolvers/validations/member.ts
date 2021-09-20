import Joi from 'joi';

const NewMemberRules = Joi.object({
  fullName: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

export default NewMemberRules;
