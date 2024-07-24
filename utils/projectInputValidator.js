import Joi from "joi";

const projectSchema = {
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().required(),

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
