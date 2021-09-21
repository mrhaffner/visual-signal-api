import Joi from 'joi';

const EmailRules = Joi.object({
  email: Joi.string().email().required(),
});

export default EmailRules;
