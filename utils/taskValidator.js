import Joi from "joi";

const taskSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).max(1000).required(),
  priority: Joi.string().valid('Low', 'Medium', 'High').required(),
  deadline: Joi.date().required(),
  status: Joi.string().valid('Pending', 'Completed').required(),
  time_estimate: Joi.string().regex(/^\d+\s+(minutes|hour)$/).allow(null), //for example an hour
  is_recurring: Joi.boolean().default(false),
  project_id: Joi.string().guid().allow(null),
  recurrence_pattern: Joi.string().allow(null, '').when('is_recurring', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(null, '')
  })
});

export default function taskValidator(req, res, next) {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.validatedTask = value;
  next(error);
}