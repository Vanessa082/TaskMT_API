import pool from "../config/config.js";  
import taskValidator from "../utils/taskInputValidator.js";  
import { authMiddleware } from "./auth.js";  
import crypto from 'crypto';  
import express from 'express';  
import { notifyTaskCreated, notifyTaskUpdated, notifyTaskDeleted } from '../utils/notifications.js'; // Adjust the path according to your project structure.  

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

// Get all tasks  
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

// Get task by id  
router.get('/:id', authMiddleware, async (req, res, next) => {  
  const taskId = req.params.id;  
  try {  
    const gettingTask = await pool.query("SELECT * FROM tasks WHERE id = $1", [taskId]);  
    if (gettingTask.rows.length === 0) {  
      return res.status(404).json({ message: "task not found" });  
    }  
    res.json(gettingTask.rows[0]);  
  } catch (err) {  
    console.error('Error fetching task by ID:', err.message || err);  
    next(err);  
  }  
});  

// Create a task  
router.post('/', authMiddleware, taskValidator, async (req, res, next) => {  
  try {  
    const { title, description, priority, deadline, reminder, status, project_id, time_estimate, is_recurring, recurrence_pattern, dependency_task_id } = req.body;  
    const user_id = req.user_id; // Get user ID from request context  
    const uuid = crypto.randomUUID();  

    // Check task limit  
    const limitQuery = 'SELECT task_limit FROM user_settings WHERE user_id = $1';  
    const limitResult = await pool.query(limitQuery, [user_id]);  
    const taskLimit = limitResult.rows[0]?.task_limit;  

    if (taskLimit) {  
      const countQuery = 'SELECT COUNT(*) FROM tasks WHERE user_id = $1';  
      const countResult = await pool.query(countQuery, [user_id]);  
      const taskCount = parseInt(countResult.rows[0].count, 10);  

      if (taskCount >= taskLimit) {  
        // Suggest tasks of lesser priority for deletion  
        const suggestQuery = `  
          SELECT * FROM tasks  
          WHERE user_id = $1 AND priority > $2  
          ORDER BY priority ASC, deadline DESC  
          LIMIT 5;  
        `;  
        const suggestions = await pool.query(suggestQuery, [user_id, priority]);  

        return res.status(403).json({  
          message: "Task limit reached. Consider deleting lower priority tasks.",  
          suggestions: suggestions.rows  
        });  
      }  
    }  

    const addTaskQuery = `  
    INSERT INTO tasks (task_id, title, description, priority, deadline, reminder, status, user_id, project_id, created_at, updated_at, time_estimate, is_recurring, recurrence_pattern, dependency_task_id)  
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $10, $11, $12, $13)  
    RETURNING *;  
  `;  

    const insertedTask = await pool.query(addTaskQuery, [  
      uuid,  
      title,  
      description,  
      priority,  
      deadline,  
      reminder,  
      status,  
      user_id,  
      project_id || null,  
      time_estimate || null,  
      is_recurring || false,  
      recurrence_pattern || null,  
      dependency_task_id || null  
    ]);  

    // Send notification for task creation  
    notifyTaskCreated(insertedTask.rows[0]);  

    res.status(201).json(insertedTask.rows[0]);  
  } catch (error) {  
    console.error('Error creating task:', error.message || error);  
    next(error);  
  }  
});  

// Update a task  
router.put('/:id', authMiddleware, taskValidator, async (req, res, next) => {  
  const taskId = req.params.id;  
  const { title, description, deadline, reminder, priority, status, project_id, time_estimate, is_recurring, recurrence_pattern } = req.body;  

  try {  
    const updateTaskQuery = `  
      UPDATE tasks  
      SET title = $1, description = $2, deadline = $3, reminder = $4, priority = $5, status = $6, project_id = $7, updated_at = CURRENT_TIMESTAMP, time_estimate = $8, is_recurring = $9
            , recurrence_pattern = $10  
      WHERE id = $11  
      RETURNING *;  
    `;  

    const result = await pool.query(updateTaskQuery, [  
      title,  
      description,  
      deadline,  
      reminder,  
      priority,  
      status,  
      project_id || null,  
      time_estimate || null,  
      is_recurring || false,  
      recurrence_pattern || null,  
      taskId  
    ]);  

    if (result.rows.length === 0) {  
      return res.status(404).json({ message: "Task not found" });  
    }  
  
    notifyTaskUpdated(result.rows[0])
    res.status(200).json(result.rows[0]);  
  } catch (error) {  
    console.error('Error updating task:', error.message || error);  
    next(error);  
  }  
});  

// Delete a task  
router.delete('/:id', authMiddleware, async (req, res, next) => {  
  const taskId = req.params.id;  
  try {  
    const deleteTaskQuery = "DELETE FROM tasks WHERE id = $1 RETURNING *;";  
    const result = await pool.query(deleteTaskQuery, [taskId]);  

    if (result.rows.length === 0) {  
      return res.status(404).json({ message: "Task not found" });  
    }  
    notifyTaskDeleted()
    res.status(204).send(); // No Content  
  } catch (error) {  
    console.error('Error deleting task:', error.message || error);  
    next(error);  
  }  
});  

module.exports = router;