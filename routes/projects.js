import pool from "../config/config";
import projectValidator from "../utils/projectInputValidator";
import { authMiddleware } from "./auth";
import crypto from 'crypto'

const router = express.Router();

// Get projects 
router.get('/projects', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM projects;");
    if (result.rows.length < 1) {
      return res.status(404).json({ message: "No projects created yet" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err.message || err);
    next(err);
  }
});

// get project
// create project

router.post('/project', authMiddleware, projectValidator, async function (req, res, next) {
  try {
    const [name, description, deadline] = req.validatedProject;
    const user_id = req.user_id;
    const uuid = crypto.randomUUID();

    const addProjectQuery = `INSERT INTO projects (id, name, description, user_id, deadline, created_at, updated_at) VALUE ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    const insertedProject = await pool.query(addProjectQuery, [uuid, name, description, user_id, deadline])

    return res.status(201).json(insertedProject?.rows[0]);
  } catch (error) {
    console.error('Error in try-catch block:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

