import express from 'express';  
import crypto from 'crypto';  
import pool from "../config/config.js";  
import taskValidator from '../utils/taskValidator.js';  
import { authMiddleware } from "./auth.js";  
import io from '../app.js'

const router = express.Router();  

const notifyTaskCreated = (task) => {  
  const { user_id, title } = task;  
  io.emit(`notification_${user_id}`, { message: `Task created: ${title}` });  
};  

const notifyTaskUpdated = (task) => {  
  const { user_id, title } = task;  
  io.emit(`notification_${user_id}`, { message: `Task updated: ${title}` });  
};  

const notifyTaskDeleted = (task) => {  
  const { user_id, title } = task;  
  io.emit(`notification_${user_id}`, { message: `Task deleted: ${title}` });  
};  

const checkDueDates = async () => {  
  const now = new Date();  
  const threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // One day in the future  
  const dueTasks = await pool.query("SELECT * FROM tasks WHERE deadline <= $1", [threshold]);  

  dueTasks.rows.forEach(task => {  
    notifyTaskDueDate(task);  
  });  
};  

const notifyTaskDueDate = (task) => {  
  const { user_id, title, deadline } = task;  
  io.emit(`notification_${user_id}`, { message: `Task is due soon: ${title} by ${deadline}` });  
};  

setInterval(checkDueDates, 60 * 60 * 1000);  

router.post('/', authMiddleware, taskValidator, async (req, res, next) => {  
  try {  
    const { title, description, priority, deadline, reminder, status, project_id, time_estimate, is_recurring, recurrence_pattern, dependency_task_id } = req.body;  
    const user_id = req.user_id;  
    const uuid = crypto.randomUUID();  

    // Check task limit and insert task logic...  

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

    if (result.rowCount === 0) {  
      return res.status(404).json({ message: 'Task not found' });  
    }  

    const updatedTask = result.rows[0];  
    notifyTaskUpdated(updatedTask);  
    res.json(updatedTask);  
  } catch (error) {  
    console.error('Error updating task:', error.message || error);  
    next(error);  
  }  
});  

// Delete a task  
router.delete('/:id', authMiddleware, async (req, res, next) => {  
  const taskId = req.params.id;  

  try {  
    const deleteResult = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);  

    if (deleteResult.rowCount === 0) {  
      return res.status(404).json({ message: 'Task not found' });  
    }  

    const deletedTask = deleteResult.rows[0];  
    notifyTaskDeleted(deletedTask);  
    res.json({ message: 'Task deleted successfully', task: deletedTask });  
  } catch (error) {  
    console.error('Error deleting task:', error.message || error);  
    next(error);  
  }  
});  

export default router;