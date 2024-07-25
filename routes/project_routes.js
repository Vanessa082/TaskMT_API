import pool from "../config/config";
import projectValidator from "../utils/projectInputValidator";
import { authMiddleware } from "./auth";
import crypto from 'crypto'

const router = express.Router();

// create project

router.post('/project', authMiddleware, projectValidator, async function (req, res, next) {
  try {
    const [name, description, deadline] = req.validatedProject;
    const user_id = req.user_id;
    const uuid = crypto.randomUUID();
    const created_at = new Date;
    const updated_at = new Date

    const addingProjectQuery = `INSERT INTO projects (id, name, description, user_id, deadline, created_at, updated_at) VALUE ($1, $2, $3, $4, $5, $6, $7)`
    await pool.query(addingProjectQuery, [uuid, name, description, user_id, deadline, created_at, updated_at])

    return res.status(201).json({ message: 'Created Project' });
  } catch (error) {
    console.error('Error in try-catch block:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})