import Joi from 'joi';

const NewBoardRules = Joi.object({
  name: Joi.string().required(),
  color: Joi.string().valid(
    'blue',
    'orange',
    'green',
    'red',
    'purple',
    'pink',
    'lime',
    'sky',
    'grey',
  ),
});

export default NewBoardRules;
