import Joi from "joi";

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(255).required,
  description: Joi.required(),
  priority: Joi.string().max(50).required(),
  deadline: Joi.date().timestamp().required(),
  status: Joi.string().max(50).default('pending').required(),
})

// taskmt=# CREATE TABLE tasks (
//   tast_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//    title VARCHAR(255) NOT NULL,
//    description TEXT,
//    priority VARCHAR(50),
//    deadline TIMESTAMP,
//    reminder TIMESTAMP,
//    status VARCHAR(50) DEFAULT 'pending',
//    user_id UUID REFERENCES accounts(user_id),
//    project_id UUID REFERENCES projects(id),
//    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

export default function taskValidator (req, res, next) {
  const { error, value} = taskSchema.validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);
  req.validateProject = value;
  next();
}