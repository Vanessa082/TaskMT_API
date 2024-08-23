import express from 'express';  
import pool from "../config/config.js";  
import projectValidator from "../utils/projectInputValidator.js";  
import { authMiddleware } from "./auth.js";  
import crypto from 'crypto';  

import { createNotification } from '../utils/notificationHelper.js';   

const router = express.Router();  

// Create project  
router.post('/', authMiddleware, projectValidator, async function (req, res, next) {  
  try {  
    const { name, description, deadline } = req.validatedProject;  
    const user_id = req.user.id;  
    const uuid = crypto.randomUUID();  
    const status = 'active';   

    const addProjectQuery = `  
      INSERT INTO projects (project_id, name, description, user_id, deadline, created_at, updated_at, status, reminder)  
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $6, CURRENT_TIMESTAMP)  
      RETURNING *`;  

    const insertedProject = await pool.query(addProjectQuery, [uuid, name, description, user_id, deadline, status]);  
    
    await createNotification(user_id, `Project '${name}' created successfully!`);  

    return res.status(201).json(insertedProject.rows[0]);  
  } catch (error) {  
    console.error('Error in try-catch block:', error.message || error);  
    return res.status(500).json({ error: 'Internal server error' });  
  }  
});  

// Update project by ID  
router.put('/:id', authMiddleware, projectValidator, async (req, res, next) => {  
  const projectId = req.params.id;  
  const { name, description, deadline, status } = req.validatedProject; // Get the validated project data  

  try {  
    const updateProjectQuery = `  
      UPDATE projects   
      SET name = $1, description = $2, deadline = $3, status = $4, reminder = $5, updated_at = CURRENT_TIMESTAMP  
      WHERE project_id = $6  
      RETURNING *;`;  
      
    const result = await pool.query(updateProjectQuery, [name, description, deadline, status, projectId]);  

    if (result.rows.length === 0) {  
      return res.status(404).json({ message: "Project not found" });  
    }  

    // Create a notification for the user  
    const userId = result.rows[0].user_id; // Extracting the user ID from the updated project  
    await createNotification(userId, `Project '${name}' updated successfully!`);  

    return res.status(200).json(result.rows[0]); // Return the updated project  
  } catch (error) {  
    console.error('Error updating project:', error.message || error);  
    return res.status(500).json({ error: 'Internal server error' });  
  }  
});  

// Delete project  
router.delete("/:id", authMiddleware, async (req, res, next) => {  
  const projectId = req.params.id;  

  try {  
    const deleteProjectQuery = `  
      DELETE FROM projects  
      WHERE project_id = $1  
      RETURNING *;`;  

    const result = await pool.query(deleteProjectQuery, [projectId]);  

    if (result.rowCount === 0) {  
      const notFoundError = new Error("Project does not exist");  
      notFoundError.status = 404;  
      return next(notFoundError);  
    }  

    // Create a notification for the user  
    const userId = result.rows[0].user_id; // Extracting the user ID from the deleted project  
    await createNotification(userId, `Project '${result.rows[0].name}' deleted successfully!`);  

    return res.status(200).json({ message: "Project deleted successfully", project: result.rows[0] });  
  } catch (error) {  
    console.error('Error deleting project:', error.message || error);  
    return res.status(500).json({ error: 'Internal server error' });  
  }  
});  

export default router;