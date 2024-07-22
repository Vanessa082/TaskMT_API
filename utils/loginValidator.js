import Joi from "joi";

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(8).required()
})

export default function loginValidator(req, res, next) {
  const { error } = loginSchema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message)
  next();
}