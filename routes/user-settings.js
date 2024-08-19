import pool from "../config/config.js";
import { authMiddleware } from "./auth.js";
import express from 'express';

const router = express.Router();

// Set task limit for a user
router.post('/set-task-limit', authMiddleware, async (req, res, next) => {
  const { task_limit } = req.body;
  const user_id = req.user_id;

  try {
    const query = `
      INSERT INTO user_settings (user_id, task_limit)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET task_limit = EXCLUDED.task_limit
      RETURNING *;
    `;
    const result = await pool.query(query, [user_id, task_limit]);

    res.status(200).json({ message: "Task limit set successfully", settings: result.rows[0] });
  } catch (err) {
    console.error('Error setting task limit:', err.message || err);
    next(err);
  }
});

export default router;
