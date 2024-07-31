import express from 'express';
import pool from "../config/config.js";
import projectValidator from "../utils/projectInputValidator.js";
import { authMiddleware } from "./auth.js";
import crypto from 'crypto'

const router = express.Router()

// Get projects 

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM projects;");
    if (result.rows.length < 1) {
      return res.status(200).json([]);
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err.message || err);
    next(err);
  }
});

// get project by id

router.get('/:id', authMiddleware, async (req, res, next) => {
  const projectId = req.params.id;
  try {
    const gettingProject = await pool("SELECT * FROM projects WHERE id = $1", [projectId]);
    if (gettingProject.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(gettingProject.rows[0]);
  } catch (err) {
    console.error('Error fetching project by ID:', err.message || err);
    next(err);
  }
});

// create project

router.post('/', authMiddleware, projectValidator, async function (req, res, next) {
  try {
    const { name, description, deadline } = req.validatedProject;
    const user_id = req.user_id;
    const uuid = crypto.randomUUID();

    const addProjectQuery = `
      INSERT INTO projects (id, name, description, user_id, deadline, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`; // Add RETURNING * to get the inserted project data

    const insertedProject = await pool.query(addProjectQuery, [uuid, name, description, user_id, deadline]);

    return res.status(201).json(insertedProject.rows[0]);
  } catch (error) {
    console.error('Error in try-catch block:', error.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// uodating project by id

router.put('/:id', authMiddleware, projectValidator, async (req, res, next) => {
  const projectId = req.params.id;
  const { name, description, deadline } = req.validatedProject; // Get the validated project data

  try {
    const updateProjectQuery = `
      UPDATE projects 
      SET name = $1, description = $2, deadline = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const result = await pool.query(updateProjectQuery, [name, description, deadline, projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(result.rows[0]); // Return the updated project
  } catch (error) {
    console.error('Error updating project:', error.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// delete project 

router.delete("/:id", authMiddleware, async (req, res, next) => {
  const projectId = req.params.id;

  try {
    const deleteProjectQuery = `
      DELETE FROM projects
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(deleteProjectQuery, [projectId]);

    if (result.rowCount === 0) {
      const notFoundError = new Error("Project does not exist");
      notFoundError.status = 404;
      return next(notFoundError);
    }

    return res.status(200).json({ message: "Project deleted successfully", project: result.rows[0] });
  } catch (error) {
    console.error('Error deleting project:', error.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;