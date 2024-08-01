import Joi from "joi";

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().required(),
  priority: Joi.string().max(50).required(),
  deadline: Joi.date().iso().required(),
  reminder: Joi.date().iso().optional(),
  status: Joi.string().max(50).default('pending').required(),
  project_id: Joi.string().uuid().optional()
});

export default function taskValidator(req, res, next) {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  req.validatedTask = value;
  next();
}