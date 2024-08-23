import pool from '../config/config.js';  
import io from '../app.js'

export const createNotification = async (userId, message) => {  
  try {  
    await pool.query('INSERT INTO notifications (message, user_id) VALUES ($1, $2)', [message, userId]);  
    
    io.emit(`notification_${userId}`, { message });  
    
  } catch (error) {  
    console.error('Error creating notification:', error);  
  }  
};