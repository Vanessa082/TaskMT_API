
import pool from "../config/config.js";
import taskValidator from "../utils/taskValidator.js";
import { authMiddleware } from "./auth.js";
import crypto from 'crypto';
import express from 'express';

const router = express.Router();

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

// create task
router.post('/', authMiddleware, taskValidator, async function (req, res, next) {  
  try {  
    const [title, description, deadline, reminder, status] = req.validatedtask;  
    const user_id = req.user_id;  
    const uuid = crypto.randomUUID();  

    const addtaskQuery = `INSERT INTO tasks (tast_id, title, description, priority, deadline, reminder, status, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;  
    
    const insertedtask = await pool.query(addtaskQuery, [uuid, title, description, status, deadline, reminder, user_id]);  
    
    // Create a notification for the task  
    const notificationMessage = `Task "${title}" has been created and is due on ${deadline}.`;  
    await createNotification(task_id, uuid, notificationMessage);  

    // Notify user for reminders  
    const notificationTime = new Date(deadline).getTime() - Date.now() - 60 * 60 * 1000; // 1 hour before the deadline  

    if (notificationTime > 0) {  
      setTimeout(async () => {  
        const reminderMessage = `Task "${title}" is about to expire!`;  
        await createNotification(task_id, uuid, reminderMessage);  
      }, notificationTime);  
    }  

    return res.status(201).json(insertedtask.rows[0]);  
  } catch (error) {  
    console.error('Error in try-catch block:', error?.message || error);  
    return res.status(500).json({ error: 'Internal server error' });  
  }  
});

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
// uodating task by id

router.put('/:id', authMiddleware, taskValidator, async (req, res, next) => {
  const taskId = req.params.id;
  const { name, description, deadline } = req.validatedtask; // Get the validated task data

  try {
    const updatetaskQuery = `
      UPDATE tasks 
      SET name = $1, description = $2, deadline = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const result = await pool.query(updatetaskQuery, [name, description, deadline, taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "task not found" });
    }

    return res.status(200).json(result.rows[0]); // Return the updated task
  } catch (error) {
    console.error('Error updating task:', error.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// delete task 

router.delete("/:id", authMiddleware, async (req, res, next) => {
  const taskId = req.params.id;

  try {
    const deletetaskQuery = `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await pool.query(deletetaskQuery, [taskId]);

    if (result.rowCount === 0) {
      const notFoundError = new Error("task does not exist");
      notFoundError.status = 404;
      return next(notFoundError);
    }

    return res.status(200).json({ message: "task deleted successfully", task: result.rows[0] });
  } catch (error) {
    console.error('Error deleting task:', error.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;