import pool from "../config/config.js";
import taskValidator from "../utils/taskValidator.js";
import { authMiddleware } from "./auth.js";
import crypto from 'crypto';
import express from 'express';

const router = express.Router();

// Get tasks by project_id
router.get('/', authMiddleware, async (req, res, next) => {
  const { project_id } = req.query;

  try {
    const result = await pool.query("SELECT * FROM tasks WHERE project_id = $1;", [project_id]);
    if (result.rows.length < 1) {
      return res.status(200).json([]);
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err.message || err);
    next(err);
  }
});

// Get tasks 

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM tasks;");
    if (result.rows.length < 1) {
      return res.status(404).json({ message: "No task created yet" });
    }
    res.json(result.rows);
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

// Create a task with optional project_id and dependency_task_id

router.post('/', authMiddleware, taskValidator, async (req, res, next) => {
  try {
    const { name, description, priority, deadline,  status, project_id, time_estimate, is_recurring, recurrence_pattern, } = req.body;
    const user_id = req.user_id; // Get user ID from request context
    const uuid = crypto.randomUUID();

    const addTaskQuery = `
    INSERT INTO tasks (task_id, name, description, priority, deadline, status, user_id, project_id, created_at, updated_at, time_estimate, is_recurring, recurrence_pattern)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $9, $10, $11)
    RETURNING *;
  `;

    const insertedTask = await pool.query(addTaskQuery, [
      uuid,
      name,
      description,
      priority,
      deadline,
      status,
      user_id,
      project_id || null, // Use null if project_id is not provided
      time_estimate || null, // Use null if time_estimate is not provided
      is_recurring || false, // Default to false if is_recurring is not provided
      recurrence_pattern || null, // Use null if recurrence_pattern is not provide
    ]);

    res.status(201).json(insertedTask.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error.message || error);
    next(error);
  }
});

// Update a task

router.put('/:id', authMiddleware, taskValidator, async (req, res, next) => {
  const taskId = req.params.task_id;
  const { name, description, deadline, reminder, priority, status, project_id, time_estimate, is_recurring, recurrence_pattern } = req.body;

  try {
    const updateTaskQuery = `
      UPDATE tasks
      SET name = $1, description = $2, deadline = $3, reminder = $4, priority = $5, status = $6, project_id = $7, updated_at = CURRENT_TIMESTAMP, time_estimate = $8, is_recurring = $9, recurrence_pattern = $10
      WHERE task_id = $11
      RETURNING *;
    `;
    const updatedTask = await pool.query(updateTaskQuery, [
      name,
      description,
      deadline,
      reminder,
      priority,
      status,
      project_id || null, // Use null if project_id is not provided
      time_estimate || null, // Use null if time_estimate is not provided
      is_recurring || false, // Default to false if is_recurring is not provided
      recurrence_pattern || null, // Use null if recurrence_pattern is not provided
      taskId
    ]);

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

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

router.delete("/:id", authMiddleware, async (req, res, next) => {
  const taskId = req.params.id;

  try {
    // Query to delete the task
    const deleteTaskQuery = `
      DELETE FROM tasks
      WHERE task_id = $1
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