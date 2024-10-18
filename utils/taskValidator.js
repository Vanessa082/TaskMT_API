import Joi from "joi";

const taskSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).max(1000).optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').optional().default('Not Started'),
  status: Joi.string().valid('Not Started', 'Pending', 'Completed', 'On hold').required().default('Not Started'),
  start_time: Joi.date().optional().allow(null),
  deadline: Joi.date().optional().allow(null),
  time_estimate: Joi.string().regex(/^\d+\s+(minute|hour)$/).optional().allow(null, ''), //for example an hour
  is_recurring: Joi.boolean().default(false).optional(),
  project_id: Joi.string().guid().optional().allow(null, ''),
  recurrence_pattern: Joi.string().allow(null, '').when('is_recurring', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(null, '')
  })
});

const updateTaskSchemaKeys = Object.keys(taskSchema.describe().keys);

const taskUpdateSchema = taskSchema.fork(updateTaskSchemaKeys, (schema) => schema.optional());

function createTaskValidator(req, res, next) {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.validatedTask = value;
  next(error);
};

function updateTaskValidator(req, res, next) {
  const { error, value } = taskUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.validatedTask = value;
  next(error);
};

export {
  createTaskValidator,
  updateTaskValidator,
}