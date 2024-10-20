import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

pool.connect()
  .then(() => {
    console.log('Connected to the database on port 5432');
  })
  .catch((err) => {
    console.error('Failed to connect to the database', err);
    process.exit(-1); // Exit process with failure
  });

  export const appConfig = {
    JWT_SECRET: process.env.SECRET_KEY,
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME
  }

export default pool;
