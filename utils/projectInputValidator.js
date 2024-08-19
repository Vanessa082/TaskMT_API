import Joi from "joi";

const projectSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().required(),
  deadline: Joi.date().required(),
  status: Joi.string().default("active"),
});

export default function projectValidator(req, res, next) {
  const { error, value } = projectSchema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });
  req.validatedProject = value;
  next();
}

// CREATE TABLE projects (
//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   name VARCHAR(255) NOT NULL,
//   description TEXT,
//   deadline TIMESTAMP,
//   user_id UUID REFERENCES accounts(user_id),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
