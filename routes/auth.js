import pool from '../config/config.js';
import express from 'express';
import registrationValidator from '../utils/registrationValidator.js';
import bcrypt from 'bcrypt';
import loginValidator from '../utils/loginValidator.js';
import { signToken, verifyToken } from '../utils/jwt.js';

const router = express.Router();

// Register new user
router.post('/register', registrationValidator, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Checking if user already exists
    const userCheckQuery = `SELECT * FROM accounts WHERE email = $1`;
    const existingUsers = await pool.query(userCheckQuery, [email]);

    if (existingUsers?.rows?.length > 0) {
      return res.status(401).json({ error: 'User already exists, please login' });
    }

    // Hashing password
    const saltRound = 10;
    const hash = await bcrypt.hash(password, saltRound);

    // Storing user details
    const addUserQuery = `INSERT INTO accounts (username, email, password, created_at) VALUES ($1, $2, $3, NOW())`;
    await pool.query(addUserQuery, [username, email, hash]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in try-catch block:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', loginValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Checking if user exists
    const userCheckQuery = `SELECT * FROM accounts WHERE email = $1`;
    const existingUser = await pool.query(userCheckQuery, [email]);
    const user = existingUser.rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid Email or Password' });

    // Checking password
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) return res.status(401).json({ error: 'Invalid Email or Password' });

    // Generating token
    const token = signToken({
      id: user.user_id,
      email: user.email
    }, { expiresIn: '2d' });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error in try-catch block:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route
router.get('/protected', authMiddleware, (req, res, next) => {
  const user = req.user;
  return res.status(200).json({ message: `Welcome back ${user.email}` });
});

// Authentication middleware
export async function authMiddleware(req, res, next) {
  const token = req.get('Authorization')?.split(" ").pop();

  if (!token) {
    return res.status(400).json({ error: "Bad Request: token is required" });
  }

  try {
    const jwtPayload = verifyToken(token);

    // Check if the token is valid and not expired
    if (!jwtPayload) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }

    // Check if the user exists with this credentials
    const userCheckQuery = `select * from accounts where user_id = $1 AND email = $2`;
    const existingUser = await pool.query(userCheckQuery, [jwtPayload.id, jwtPayload.email]);

    if (existingUser?.rows?.length === 0) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    req.user = jwtPayload;
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default router;
