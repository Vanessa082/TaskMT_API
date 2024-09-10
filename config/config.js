import pg from "pg";
import dotenv from "dotenv";
import { google } from "googleapis";

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
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET_KEY,
    REFRESH_JWT_EXPIRATION_TIME: process.env.REFRESH_JWT_EXPIRATION_TIME
  }

  export const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
  )

export default pool;
