import express from 'express';  
const router = express.Router();  
const pool = require('../db');   
import { io } from '../server'; 

router.get('/notifications/:userId', async (req, res) => {  
  try {  
    const userId = req.params.userId;  
    const notifications = await pool.query('SELECT * FROM notifications WHERE user_id = $1', [userId]);  
    res.json(notifications.rows);  
  } catch (error) {  
    console.error(error);  
    res.status(500).json({ message: 'Internal server error' });  
  }  
});  

router.post('/notifications', async (req, res) => {  
  try {  
    const { message, userId } = req.body;  
    await pool.query('INSERT INTO notifications (message, user_id) VALUES ($1, $2)', [message, userId]);  
    
    io.emit(`notification_${userId}`, { message });  
    res.status(201).json({ message: 'Notification created successfully' });  
  } catch (error) {  
    console.error(error);  
    res.status(500).json({ message: 'Internal server error' });  
  }  
});  

export default router; 