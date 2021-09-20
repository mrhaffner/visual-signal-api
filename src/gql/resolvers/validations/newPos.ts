import Joi from 'joi';

const NewPosRules = Joi.object({
  pos: Joi.number().required(),
});

export default NewPosRules;
