import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
  

pool.connect()
  .then(client => {
    console.log('Connected to the database');
    client.release();
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });

export default pool;
