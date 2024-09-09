import express from 'express';  
import pool from "../config/config.js";  
// import { authMiddleware } from "./auth.js";  
import { io } from '../app.js';   
import router from './auth.js';

// const router = express.Router();  

// Get notifications for a user  
router.get('/',  async (req, res, next) => {  
  const userId = req.user_id;  

  try {  
    const result = await pool.query("SELECT * FROM notifications WHERE task_id = $1 ORDER BY created_at DESC", [userId]);  
    res.json(result.rows);  
  } catch (err) {  
    console.error('Error fetching notifications:', err.message || err);  
    next(err);  
  }  
});  

// Create a notification and emit it via Socket.io (for future use)  
const createNotification = async (userId, taskId, message) => {  
  try {  
    const insertQuery = `INSERT INTO notifications (user_id, task_id, message) VALUES ($1, $2, $3) RETURNING *;`;  
    const result = await pool.query(insertQuery, [userId, taskId, message]);  

    // Emit the notification to the user via Socket.io  
    io.to(userId).emit('newNotification', result.rows[0]);  
    return result.rows[0];  
  } catch (error) {  
    console.error('Error creating notification:', error.message || error);  
    throw error;  
  }  
};  

export default router;


