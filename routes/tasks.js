import pool from "../config/config.js";
import { createTaskValidator, updateTaskValidator } from "../utils/taskValidator.js";
import { authMiddleware } from "./auth.js";
import crypto from 'crypto';
import express from 'express';

const router = express.Router();

// Get tasks  with or without project id

// Get tasks  with or without project id

router.get('/', authMiddleware, async (req, res, next) => {
  const { project_id, priority, status } = req.query;

  try {
    let result;
    if (project_id) {
      result = await pool.query("SELECT * FROM tasks WHERE project_id = $1;", [project_id]);
    } else {
      result = await pool.query("SELECT * FROM tasks;")
      // result = await pool.query("SELECT * FROM tasks WHERE project_id is null;");
    }

    if (priority) {
      result = await pool.query("SELECT * FROM tasks WHERE priority = $1;", [priority]);
    } else {
      result = await pool.query("SELECT * FROM tasks;")
      // result = await pool.query("SELECT * FROM tasks WHERE project_id is null;");
    }

    if (status) {
      result = await pool.query("SELECT * FROM tasks WHERE status = $1;", [status]);
    } else {
      result = await pool.query("SELECT * FROM tasks;")
      // result = await pool.query("SELECT * FROM tasks WHERE project_id is null;");
    }

    if (result.rows.length < 1) {
      return res.status(204).json({ message: "No task created yet" });
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err.message || err);
    next(err);
  }
});

// get task by id

router.get('/:id', authMiddleware, async (req, res, next) => {
  const taskId = req.params.id;
  try {
    const gettingtask = await pool("SELECT * FROM tasks WHERE id = $1", [taskId]);
    if (gettingtask.rows.length === 0) {
      return res.status(404).json({ message: "task not found" });
    }
    res.json(gettingtask.rows[0]);
  } catch (err) {
    console.error('Error fetching task by ID:', err.message || err);
    next(err);
  }
});

// Create a task with 

router.post('/', authMiddleware, createTaskValidator, async (req, res, next) => {
  try {
    const { name, description, priority, start_time, deadline, status, project_id, time_estimate, is_recurring, recurrence_pattern } = req.validatedTask;
    const user_id = req.user.user_id; // Get user ID from request context
    const uuid = crypto.randomUUID();

    const addTaskQuery = `
      INSERT INTO tasks (id, name, description, priority, start_time, deadline, status, user_id, project_id, time_estimate, is_recurring, recurrence_pattern)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const insertedTask = await pool.query(addTaskQuery, [
      uuid,
      name,
      description,
      priority,
      start_time,
      deadline,
      status,
      user_id,
      project_id || null, // Use null if project_id is not provided
      time_estimate || null, // Use null if time_estimate is not provided
      is_recurring || false, // Default to false if is_recurring is not provided
      recurrence_pattern || null // Use null if recurrence_pattern is not provided
    ]);

    res.status(201).json(insertedTask.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error.message || error);
    next(error);
  }
});

// Update a task

router.put('/:id', authMiddleware, updateTaskValidator, async (req, res, next) => {
  const taskId = req.params.id;
  const fieldsToUpdate = {};
  const validFields = [
    'name', 'description', 'deadline', 'reminder', 'priority', 'status', 'project_id',
    'time_estimate', 'is_recurring', 'recurrence_pattern'
  ];

  validFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  try {
    const setClause = Object.keys(fieldsToUpdate)
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(taskId);  // Add taskId as the last parameter for the WHERE clause

    const updateTaskQuery = `
      UPDATE tasks
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *;
    `;

    const updatedTask = await pool.query(updateTaskQuery, values);

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error.message || error);
    next(error);
  }
});

// delete task 

// delete task 

router.delete("/:id", authMiddleware, async (req, res, next) => {
  const taskId = req.params.id;

  try {
    // Query to delete the task
    const deleteTaskQuery = `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING *;
    `;

    // Execute the query
    const result = await pool.query(deleteTaskQuery, [taskId]);

    // Check if any rows were deleted
    if (result.rowCount === 0) {
      const notFoundError = new Error("Task does not exist");
      notFoundError.status = 404;
      return next(notFoundError);
    }

    // Respond with the deleted task details
    return res.status(200).json({ message: "Task deleted successfully", task: result.rows[0] });
  } catch (error) {
    console.error('Error deleting task:', error.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;