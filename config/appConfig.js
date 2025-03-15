import dotenv from "dotenv";

dotenv.config();

export const appConfig = {
  JWT_SECRET: process.env.SECRET_KEY,
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET_KEY,
  REFRESH_JWT_EXPIRATION_TIME: process.env.REFRESH_JWT_EXPIRATION_TIME,
  FRONT_END_URL: process.env.FRONT_END_URL,
}