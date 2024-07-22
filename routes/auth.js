import pool from '../config/dbconfig.js';
import express from 'express';
import registrationValidator from '../utils/registrationValidator.js';
import bcript, { hash } from 'bcrypt';
import loginValidator from '../utils/loginValidator.js';


const router = express.Router();

// register new user

router.post('/register', registrationValidator, async function (req, res, next) {
  try {
    const { username, email, password } = req.body;

    // checking if user already exist

    const userCheckQuery = `select * from accounts where email = $1`
    const existingUsers = await pool.query(userCheckQuery, [email]);

    if (existingUsers?.rows?.length > 0) {
      return res.status(401).json({ error: 'user already exist please login' });
    }

    // hashing password

    const saltRound = 10;
    const hash = await bcript.hash(password, saltRound);

    // storing user details
    const addUserQuery = `insert into accounts (username, email, password, created_at) values($1, $2, $3, now())`;

    await pool.query(addUserQuery, [username, email, hash]);

    return res.status(201).json({ message: 'User registered succesfully' });
  } catch (error) {
    console.error('Error in try-catch block:', error?.message || error
    );
    return res.status(500).json({ error: 'Internal server error' });
  }
})

// Login route

router.post('./login', loginValidator, async function (req, res, next) {
  try {
    const {email, password} = req.body;
    const userCheckQuery = `select * from accounts where email =$1`
    const existingUser = await pool.query(userCheckQuery, [email]);

    const user = existingUser.rows[0];

    if(!user) return res.status(401).json({error:'Invalid Email or Password'});

    
  } catch (error) {
    
  }
})


export default router;
