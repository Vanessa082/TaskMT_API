import Joi from "joi";

const projectSchema = {
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().required(),
  deadline: Joi.date().required(),
  created_at: Joi.date().default(() => new Date(), 'time of creation'),
  updated_at: Joi.date().default(() => new Date(), 'time of update')
}
export default function projectValidator () {
  const { error } = projectSchema.validate(req.body);
  if(error) return res.status(400).send(error.details[0].message)
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
