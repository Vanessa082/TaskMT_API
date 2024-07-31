import Joi from "joi";

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required()
})

export default function registrationValidator(req, res, next) {
  const { error } = registerSchema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  next();
};