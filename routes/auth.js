import pool, { appConfig, oauth2Client } from '../config/config.js';
import express from 'express';
import registrationValidator from '../utils/registrationValidator.js';
import bcrypt from 'bcrypt';
import loginValidator from '../utils/loginValidator.js';
import { signToken, verifyToken } from '../utils/jwt.js';
import crypto from 'crypto'
import { url } from '../utils/redirectUrl.js';

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
    const uuid = crypto.randomUUID();

    // Storing user details
    const addUserQuery = `INSERT INTO accounts (user_id, username, email, password, created_at) VALUES ($1, $2, $3, $4, NOW())`;
    await pool.query(addUserQuery, [uuid, username, email, hash]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in try-catch block:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//refresh token endpoint

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
    }, { expiresIn: appConfig.JWT_EXPIRATION_TIME });

    delete user.password;

    return res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Error in try-catch block:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// currentuser route
router.get('/current-user', authMiddleware, (req, res, next) => {
  if (req.user) {
    return res.status(200).json(req.user);
  }

  return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
});

// Authentication middleware
export async function authMiddleware(req, res, next) {
  const token = req.get('Authorization')?.split(" ").pop();

  if (!token) {
    return res.status(400).json({ error: "Bad Request: token is required" });
  }

  try {
    const jwtPayload = (() => {
      try {
        const t = verifyToken(token);
        return t;
      } catch (error) {
        return null;
      }
    })();

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

    const user = existingUser?.rows[0];

    delete user.password;

    req.user = user;

    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return res.status(401).json({ error });
  }
}


router.post('/google', (req, res) => {
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    res.redirect(`${appConfig.FRONT_END_URL}/dashboard`)
  } catch (error) {
    
    console.error('Error exchanging code for tokens', error);
    res.status(500).send('Authentication failed');
  }
})

export default router;
