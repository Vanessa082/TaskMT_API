import Joi from "joi";

const projectSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().required(),
  deadline: Joi.date().optional(),
  status: Joi.string()
});

export default function projectValidator(req, res, next) {
  const { error, value } = projectSchema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });
  req.validatedProject = value;
  next();
}
