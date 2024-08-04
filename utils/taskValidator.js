import Joi from "joi";

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).max(1000).required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  deadline: Joi.date().required(),
  reminder: Joi.date().allow(null),
  status: Joi.string().valid('pending', 'in_progress', 'complete').default('pending'),
  project_id: Joi.number().integer().optional(),
  dependency_task_id: Joi.number().integer().optional(),
  category: Joi.string().max(255).allow(null),
  time_estimate: Joi.string().regex(/^\d+\s+(minutes|hours|days)$/).allow(null), //for example an hour
  is_recurring: Joi.boolean().default(false),
  recurrence_pattern: Joi.string().allow(null, '').when('is_recurring', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(null, '')
  })
});

export default function taskValidator(req, res, next) {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  req.validatedTask = value;
  next();
}